"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { MedicineForm, MedicineTiming } from "@prisma/client";

const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  genericName: z.string().optional().nullable(),
  form: z.nativeEnum(MedicineForm).default(MedicineForm.TABLET),
  strength: z.string().optional().nullable(),
  defaultDosage: z.string().optional().nullable(),
  defaultFrequency: z.string().optional().nullable(),
  defaultDuration: z.string().optional().nullable(),
  defaultTiming: z.nativeEnum(MedicineTiming).default(MedicineTiming.AFTER_FOOD),
  defaultInstructions: z.string().optional().nullable(),
  isFavorite: z.boolean().default(false),
});

export async function getMedicines(search?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) return [];

  return prisma.medicine.findMany({
    where: {
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { genericName: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
  });
}

export async function createMedicine(formData: FormData) {
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
    name: formData.get("name"),
    genericName: formData.get("genericName") || null,
    form: formData.get("form") || MedicineForm.TABLET,
    strength: formData.get("strength") || null,
    defaultDosage: formData.get("defaultDosage") || null,
    defaultFrequency: formData.get("defaultFrequency") || null,
    defaultDuration: formData.get("defaultDuration") || null,
    defaultTiming: formData.get("defaultTiming") || MedicineTiming.AFTER_FOOD,
    defaultInstructions: formData.get("defaultInstructions") || null,
    isFavorite: formData.get("isFavorite") === "true",
  };

  const parsed = medicineSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const medicine = await prisma.medicine.create({
    data: { clinicId, doctorId, ...parsed.data },
  });

  revalidatePath("/medicines");
  return { success: true, medicine };
}

export async function updateMedicine(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) throw new Error("No clinic context");

  const raw = {
    name: formData.get("name"),
    genericName: formData.get("genericName") || null,
    form: formData.get("form") || MedicineForm.TABLET,
    strength: formData.get("strength") || null,
    defaultDosage: formData.get("defaultDosage") || null,
    defaultFrequency: formData.get("defaultFrequency") || null,
    defaultDuration: formData.get("defaultDuration") || null,
    defaultTiming: formData.get("defaultTiming") || MedicineTiming.AFTER_FOOD,
    defaultInstructions: formData.get("defaultInstructions") || null,
    isFavorite: formData.get("isFavorite") === "true",
  };

  const parsed = medicineSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await prisma.medicine.updateMany({
    where: { id, clinicId, ...(role === "DOCTOR" && { doctorId: session.user.id }) },
    data: parsed.data,
  });

  revalidatePath("/medicines");
  return { success: true };
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) throw new Error("No clinic context");

  await prisma.medicine.updateMany({
    where: { id, clinicId, ...(role === "DOCTOR" && { doctorId: session.user.id }) },
    data: { isFavorite },
  });

  revalidatePath("/medicines");
  return { success: true };
}

export async function deleteMedicine(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) throw new Error("No clinic context");

  await prisma.medicine.deleteMany({
    where: { id, clinicId, ...(role === "DOCTOR" && { doctorId: session.user.id }) },
  });

  revalidatePath("/medicines");
  return { success: true };
}
