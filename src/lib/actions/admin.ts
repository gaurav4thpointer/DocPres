"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserRole, PrescriptionType } from "@prisma/client";
import { createImpersonationToken } from "@/lib/auth";
import { parseDoctorsImportCsv } from "@/lib/doctor-import-csv";

export type ImportDoctorsResult = {
  created: number;
  errors: { row: number; message: string }[];
};

export async function getClinics(search?: string, page = 1, limit = 20) {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  if (role !== UserRole.ADMIN) return { clinics: [], total: 0 };

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [clinics, total] = await Promise.all([
    prisma.clinic.findMany({
      where,
      include: {
        _count: { select: { doctors: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clinic.count({ where }),
  ]);

  return { clinics, total };
}

/** Turns user input into a URL-safe clinic slug (lowercase, hyphens, no spaces). */
function normalizeClinicSlug(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const importClinicSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export async function importClinic(formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  if (role !== UserRole.ADMIN) throw new Error("Admin access required");

  const raw = {
    name: formData.get("name"),
    slug: normalizeClinicSlug(formData.get("slug")),
    email: formData.get("email"),
    password: formData.get("password"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
  };

  const parsed = importClinicSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const existing = await prisma.clinic.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { slug: parsed.data.slug }],
    },
  });
  if (existing) throw new Error("Clinic with this email or slug already exists");

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.clinic.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      email: parsed.data.email,
      password: passwordHash,
      address: parsed.data.address,
      phone: parsed.data.phone,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function resetClinicPassword(clinicId: string, newPassword: string) {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  if (role !== UserRole.ADMIN) throw new Error("Admin access required");
  if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.clinic.update({
    where: { id: clinicId },
    data: { password: hash },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function resetDoctorPassword(doctorId: string, newPassword: string) {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  const sessionClinicId = (session?.user as { clinicId?: string })?.clinicId;
  if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");

  if (role === UserRole.ADMIN) {
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.doctor.update({
      where: { id: doctorId },
      data: { password: hash },
    });
  } else if (role === UserRole.CLINIC && sessionClinicId) {
    const doctor = await prisma.doctor.findFirst({
      where: { id: doctorId, clinicId: sessionClinicId },
    });
    if (!doctor) throw new Error("Doctor not found");
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.doctor.update({
      where: { id: doctorId },
      data: { password: hash },
    });
  } else {
    throw new Error("Access denied");
  }

  revalidatePath("/admin");
  revalidatePath("/doctors");
  return { success: true };
}

export async function impersonateClinic(clinicId: string): Promise<{ url: string }> {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  if (role !== UserRole.ADMIN) throw new Error("Admin access required");

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });
  if (!clinic) throw new Error("Clinic not found");

  const token = await createImpersonationToken(clinicId);
  return { url: `/impersonate?token=${encodeURIComponent(token)}` };
}

const createDoctorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  registrationNo: z.string().optional(),
  mobile: z.string().optional(),
  defaultPrescriptionType: z.nativeEnum(PrescriptionType).default(PrescriptionType.GENERAL),
});

type CreateDoctorInput = z.infer<typeof createDoctorSchema>;

async function resolveTargetClinicIdForDoctorMutation(
  clinicId: string
): Promise<string> {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  const sessionClinicId = (session?.user as { clinicId?: string })?.clinicId;

  if (role === UserRole.ADMIN) {
    return clinicId;
  }
  if (role === UserRole.CLINIC && sessionClinicId) {
    if (clinicId !== sessionClinicId) throw new Error("Access denied");
    return sessionClinicId;
  }
  throw new Error("Access denied");
}

async function insertDoctorForClinic(targetClinicId: string, data: CreateDoctorInput) {
  const existing = await prisma.doctor.findFirst({
    where: { clinicId: targetClinicId, email: data.email },
  });
  if (existing) throw new Error("A doctor with this email already exists in this clinic");

  const passwordHash = await bcrypt.hash(data.password, 12);
  await prisma.doctor.create({
    data: {
      clinicId: targetClinicId,
      name: data.name,
      email: data.email,
      password: passwordHash,
      qualification: data.qualification,
      specialization: data.specialization,
      registrationNo: data.registrationNo,
      mobile: data.mobile,
      defaultPrescriptionType: data.defaultPrescriptionType,
    },
  });
}

export async function createDoctor(clinicId: string, formData: FormData) {
  const targetClinicId = await resolveTargetClinicIdForDoctorMutation(clinicId);

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    qualification: formData.get("qualification") || undefined,
    specialization: formData.get("specialization") || undefined,
    registrationNo: formData.get("registrationNo") || undefined,
    mobile: formData.get("mobile") || undefined,
    defaultPrescriptionType: formData.get("defaultPrescriptionType") || PrescriptionType.GENERAL,
  };

  const parsed = createDoctorSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await insertDoctorForClinic(targetClinicId, parsed.data);

  revalidatePath("/admin");
  revalidatePath("/doctors");
  return { success: true };
}

const MAX_DOCTOR_IMPORT_ROWS = 500;
const MAX_DOCTOR_IMPORT_CHARS = 2 * 1024 * 1024;

export async function importDoctorsFromCsv(
  clinicId: string,
  csvText: string
): Promise<ImportDoctorsResult> {
  const targetClinicId = await resolveTargetClinicIdForDoctorMutation(clinicId);

  if (csvText.length > MAX_DOCTOR_IMPORT_CHARS) {
    throw new Error("File is too large (max 2 MB)");
  }

  let parsedRows;
  try {
    parsedRows = parseDoctorsImportCsv(csvText).rows;
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Invalid CSV");
  }

  if (parsedRows.length > MAX_DOCTOR_IMPORT_ROWS) {
    throw new Error(`Too many rows (max ${MAX_DOCTOR_IMPORT_ROWS})`);
  }

  const errors: { row: number; message: string }[] = [];
  let created = 0;
  const headerRowOffset = 2;

  for (let i = 0; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    const csvRowNumber = i + headerRowOffset;

    const rawType = (row.defaultPrescriptionType || "GENERAL").trim().toUpperCase();
    if (rawType !== "GENERAL" && rawType !== "EYE") {
      errors.push({
        row: csvRowNumber,
        message:
          "defaultPrescriptionType must be GENERAL or EYE (empty defaults to GENERAL)",
      });
      continue;
    }
    const defaultPrescriptionType =
      rawType === "EYE" ? PrescriptionType.EYE : PrescriptionType.GENERAL;

    const parsed = createDoctorSchema.safeParse({
      name: row.name,
      email: row.email,
      password: row.password,
      qualification: row.qualification || undefined,
      specialization: row.specialization || undefined,
      registrationNo: row.registrationNo || undefined,
      mobile: row.mobile || undefined,
      defaultPrescriptionType,
    });

    if (!parsed.success) {
      errors.push({ row: csvRowNumber, message: parsed.error.issues[0]?.message ?? "Invalid row" });
      continue;
    }

    try {
      await insertDoctorForClinic(targetClinicId, parsed.data);
      created++;
    } catch (e) {
      errors.push({
        row: csvRowNumber,
        message: e instanceof Error ? e.message : "Failed to create doctor",
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/doctors");
  return { created, errors };
}

export async function getClinicDoctors(clinicId: string) {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  const sessionClinicId = (session?.user as { clinicId?: string })?.clinicId;

  if (role === UserRole.ADMIN) {
    return prisma.doctor.findMany({
      where: { clinicId },
      select: { id: true, name: true, email: true, isActive: true, defaultPrescriptionType: true },
      orderBy: { name: "asc" },
    });
  }

  if (role === UserRole.CLINIC && sessionClinicId === clinicId) {
    return prisma.doctor.findMany({
      where: { clinicId },
      select: { id: true, name: true, email: true, isActive: true, defaultPrescriptionType: true },
      orderBy: { name: "asc" },
    });
  }

  return [];
}
