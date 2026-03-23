"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";
import { PrescriptionType, UserRole } from "@prisma/client";

const doctorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  registrationNo: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().optional(),
  defaultPrescriptionType: z.nativeEnum(PrescriptionType).optional(),
});

const clinicSchema = z.object({
  clinicName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  footerText: z.string().optional(),
});

export async function getDoctorProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: string }).role;

  if (role === "CLINIC") {
    const clinic = await prisma.clinic.findUnique({
      where: { id: session.user.id },
    });
    if (!clinic) return null;
    return {
      id: clinic.id,
      name: clinic.name,
      qualification: null,
      specialization: null,
      registrationNo: null,
      mobile: null,
      email: clinic.email,
      clinicSettings: {
        id: "",
        doctorId: "",
        clinicId: clinic.id,
        clinicName: clinic.name,
        address: clinic.address,
        phone: clinic.phone,
        logoPath: clinic.logoPath,
        footerText: clinic.footerText,
        signaturePath: null,
        stampPath: null,
        createdAt: clinic.createdAt,
        updatedAt: clinic.updatedAt,
      },
    };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: session.user.id },
    include: {
      clinicSettings: true,
      clinic: {
        select: {
          name: true,
          address: true,
          phone: true,
          logoPath: true,
          footerText: true,
        },
      },
    },
  });
  if (!doctor) return null;

  const { clinic: clinicRow, ...doctorRest } = doctor;

  const mergedSettings =
    doctorRest.clinicSettings == null
      ? {
          id: "",
          doctorId: doctorRest.id,
          clinicId: doctorRest.clinicId,
          clinicName: clinicRow.name,
          address: clinicRow.address,
          phone: clinicRow.phone,
          logoPath: clinicRow.logoPath,
          signaturePath: null as string | null,
          stampPath: null as string | null,
          footerText: clinicRow.footerText,
          createdAt: doctorRest.createdAt,
          updatedAt: doctorRest.updatedAt,
        }
      : {
          ...doctorRest.clinicSettings,
          clinicName: doctorRest.clinicSettings.clinicName ?? clinicRow.name,
          address: doctorRest.clinicSettings.address ?? clinicRow.address,
          phone: doctorRest.clinicSettings.phone ?? clinicRow.phone,
          logoPath: doctorRest.clinicSettings.logoPath ?? clinicRow.logoPath,
          footerText: doctorRest.clinicSettings.footerText ?? clinicRow.footerText,
        };

  return {
    ...doctorRest,
    clinicSettings: mergedSettings,
  };
}

export async function getDefaultPrescriptionType(): Promise<PrescriptionType> {
  const session = await auth();
  if (!session?.user?.id) return PrescriptionType.GENERAL;
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) return PrescriptionType.GENERAL;

  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: { id: session.user.id },
      select: { defaultPrescriptionType: true },
    });
    return doctor?.defaultPrescriptionType ?? PrescriptionType.GENERAL;
  }

  const firstDoctor = await prisma.doctor.findFirst({
    where: { clinicId },
    select: { defaultPrescriptionType: true },
  });
  return firstDoctor?.defaultPrescriptionType ?? PrescriptionType.GENERAL;
}

export type DoctorForPrescription = {
  id: string;
  name: string;
  defaultPrescriptionType: PrescriptionType | null;
};

export async function getDoctorsForPrescription(): Promise<DoctorForPrescription[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) return [];

  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, defaultPrescriptionType: true },
    });
    return doctor ? [doctor] : [];
  }

  return prisma.doctor.findMany({
    where: { clinicId, isActive: true },
    select: { id: true, name: true, defaultPrescriptionType: true },
    orderBy: { name: "asc" },
  });
}

export async function updateDoctorProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const role = (session.user as { role?: string }).role;
  if (role === "CLINIC") throw new Error("Clinic profile cannot be updated from doctor settings");
  if (role === UserRole.ADMIN) throw new Error("Access denied");

  const data = {
    name: formData.get("name") as string,
    qualification: formData.get("qualification") as string,
    specialization: formData.get("specialization") as string,
    registrationNo: formData.get("registrationNo") as string,
    mobile: formData.get("mobile") as string,
    defaultPrescriptionType: formData.get("defaultPrescriptionType") as PrescriptionType | undefined,
  };

  const parsed = doctorSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await prisma.doctor.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      qualification: parsed.data.qualification,
      specialization: parsed.data.specialization,
      registrationNo: parsed.data.registrationNo,
      mobile: parsed.data.mobile,
      ...(parsed.data.defaultPrescriptionType && {
        defaultPrescriptionType: parsed.data.defaultPrescriptionType,
      }),
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateClinicSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const role = (session.user as { role?: string }).role;
  const clinicId = (session.user as { clinicId?: string }).clinicId;

  const data = {
    clinicName: formData.get("clinicName") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    footerText: formData.get("footerText") as string,
  };

  const parsed = clinicSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  // Handle file uploads
  const updates: Record<string, string> = {
    ...parsed.data,
  };

  const logoFile = formData.get("logo") as File | null;
  const signatureFile = formData.get("signature") as File | null;
  const stampFile = formData.get("stamp") as File | null;

  if (logoFile && logoFile.size > 0) {
    updates.logoPath = await uploadFile(logoFile, "clinic");
  }
  if (signatureFile && signatureFile.size > 0) {
    updates.signaturePath = await uploadFile(signatureFile, "clinic");
  }
  if (stampFile && stampFile.size > 0) {
    updates.stampPath = await uploadFile(stampFile, "clinic");
  }

  if (role === "CLINIC" && clinicId) {
    await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        name: updates.clinicName ?? undefined,
        address: updates.address ?? undefined,
        phone: updates.phone ?? undefined,
        footerText: updates.footerText ?? undefined,
        logoPath: updates.logoPath ?? undefined,
      },
    });
  } else if (role === UserRole.DOCTOR && clinicId) {
    await prisma.clinicSettings.upsert({
      where: { doctorId: session.user.id },
      update: updates,
      create: {
        doctorId: session.user.id,
        clinicId,
        ...updates,
      },
    });
  } else {
    throw new Error("Access denied");
  }

  revalidatePath("/settings");
  return { success: true };
}
