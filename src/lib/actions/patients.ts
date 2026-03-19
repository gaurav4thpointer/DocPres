"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Gender } from "@prisma/client";

const patientSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  age: z.coerce.number().int().min(0).max(150).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.nativeEnum(Gender),
  mobile: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  chronicConditions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  weight: z.coerce.number().min(0).max(500).optional().nullable(),
});

export async function getPatients(search?: string, page = 1, limit = 20) {
  const session = await auth();
  if (!session?.user?.id) return { patients: [], total: 0 };
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) return { patients: [], total: 0 };

  const where = {
    clinicId,
    ...(role === "DOCTOR" && { doctorId: session.user.id }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" as const } },
        { mobile: { contains: search } },
      ],
    }),
  };

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  return { patients, total };
}

export async function getPatient(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  if (!clinicId) return null;

  const role = (session.user as { role?: string }).role;
  return prisma.patient.findFirst({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
    },
    include: {
      prescriptions: {
        orderBy: { prescriptionDate: "desc" },
        take: 10,
        include: { items: true },
      },
    },
  });
}

export async function createPatient(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) throw new Error("No clinic context");

  let doctorId = session.user.id;
  if (role === "CLINIC") {
    const firstDoctor = await prisma.doctor.findFirst({
      where: { clinicId },
      select: { id: true },
    });
    if (!firstDoctor) throw new Error("Clinic has no doctors. Add a doctor first.");
    doctorId = firstDoctor.id;
  }

  const raw = {
    fullName: formData.get("fullName"),
    age: formData.get("age") || null,
    dateOfBirth: formData.get("dateOfBirth") || null,
    gender: formData.get("gender"),
    mobile: formData.get("mobile") || null,
    address: formData.get("address") || null,
    allergies: formData.get("allergies") || null,
    chronicConditions: formData.get("chronicConditions") || null,
    notes: formData.get("notes") || null,
    weight: formData.get("weight") || null,
  };

  const parsed = patientSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const patient = await prisma.patient.create({
    data: {
      clinicId,
      doctorId,
      ...parsed.data,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      age: parsed.data.age ?? null,
      weight: parsed.data.weight ?? null,
    },
  });

  revalidatePath("/patients");
  return { success: true, patient };
}

export async function updatePatient(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  if (!clinicId) throw new Error("No clinic context");

  const raw = {
    fullName: formData.get("fullName"),
    age: formData.get("age") || null,
    dateOfBirth: formData.get("dateOfBirth") || null,
    gender: formData.get("gender"),
    mobile: formData.get("mobile") || null,
    address: formData.get("address") || null,
    allergies: formData.get("allergies") || null,
    chronicConditions: formData.get("chronicConditions") || null,
    notes: formData.get("notes") || null,
    weight: formData.get("weight") || null,
  };

  const parsed = patientSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const role = (session.user as { role?: string }).role;
  const patient = await prisma.patient.updateMany({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
    },
    data: {
      ...parsed.data,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      age: parsed.data.age ?? null,
      weight: parsed.data.weight ?? null,
    },
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  return { success: true, patient };
}

export async function deletePatient(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  if (!clinicId) throw new Error("No clinic context");

  const role = (session.user as { role?: string }).role;
  await prisma.patient.deleteMany({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
    },
  });

  revalidatePath("/patients");
  return { success: true };
}
