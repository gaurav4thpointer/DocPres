"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";

const doctorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  registrationNo: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().optional(),
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

  return prisma.doctor.findUnique({
    where: { id: session.user.id },
    include: { clinicSettings: true },
  });
}

export async function updateDoctorProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const data = {
    name: formData.get("name") as string,
    qualification: formData.get("qualification") as string,
    specialization: formData.get("specialization") as string,
    registrationNo: formData.get("registrationNo") as string,
    mobile: formData.get("mobile") as string,
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
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateClinicSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

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

  await prisma.clinicSettings.upsert({
    where: { doctorId: session.user.id },
    update: updates,
    create: {
      doctorId: session.user.id,
      ...updates,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}
