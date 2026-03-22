"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { UserRole, PrescriptionType } from "@prisma/client";
import { signIn } from "@/lib/auth";
import { createImpersonationToken } from "@/lib/auth";

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

export async function createDoctor(clinicId: string, formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  const sessionClinicId = (session?.user as { clinicId?: string })?.clinicId;

  let targetClinicId: string;
  if (role === UserRole.ADMIN) {
    targetClinicId = clinicId;
  } else if (role === UserRole.CLINIC && sessionClinicId) {
    if (clinicId !== sessionClinicId) throw new Error("Access denied");
    targetClinicId = sessionClinicId;
  } else {
    throw new Error("Access denied");
  }

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

  const existing = await prisma.doctor.findFirst({
    where: { clinicId: targetClinicId, email: parsed.data.email },
  });
  if (existing) throw new Error("A doctor with this email already exists in this clinic");

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.doctor.create({
    data: {
      clinicId: targetClinicId,
      name: parsed.data.name,
      email: parsed.data.email,
      password: passwordHash,
      qualification: parsed.data.qualification,
      specialization: parsed.data.specialization,
      registrationNo: parsed.data.registrationNo,
      mobile: parsed.data.mobile,
      defaultPrescriptionType: parsed.data.defaultPrescriptionType,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/doctors");
  return { success: true };
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
