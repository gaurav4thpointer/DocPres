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

  const where = {
    doctorId: session.user.id,
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

  return prisma.patient.findFirst({
    where: { id, doctorId: session.user.id },
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
      doctorId: session.user.id,
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

  const patient = await prisma.patient.updateMany({
    where: { id, doctorId: session.user.id },
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

  await prisma.patient.deleteMany({
    where: { id, doctorId: session.user.id },
  });

  revalidatePath("/patients");
  return { success: true };
}
