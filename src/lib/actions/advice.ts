"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const adviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export async function getAdviceTemplates() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) return [];

  return prisma.adviceTemplate.findMany({
    where: {
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
    },
    orderBy: { title: "asc" },
  });
}

export async function createAdviceTemplate(formData: FormData) {
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

  const parsed = adviceSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const template = await prisma.adviceTemplate.create({
    data: { clinicId, doctorId, ...parsed.data },
  });

  revalidatePath("/settings");
  return { success: true, template };
}

export async function deleteAdviceTemplate(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) throw new Error("No clinic context");

  await prisma.adviceTemplate.deleteMany({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
    },
  });

  revalidatePath("/settings");
  return { success: true };
}
