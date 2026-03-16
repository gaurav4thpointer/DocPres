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

  return prisma.medicine.findMany({
    where: {
      doctorId: session.user.id,
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
    data: { doctorId: session.user.id, ...parsed.data },
  });

  revalidatePath("/medicines");
  return { success: true, medicine };
}

export async function updateMedicine(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

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
    where: { id, doctorId: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/medicines");
  return { success: true };
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.medicine.updateMany({
    where: { id, doctorId: session.user.id },
    data: { isFavorite },
  });

  revalidatePath("/medicines");
  return { success: true };
}

export async function deleteMedicine(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.medicine.deleteMany({
    where: { id, doctorId: session.user.id },
  });

  revalidatePath("/medicines");
  return { success: true };
}
