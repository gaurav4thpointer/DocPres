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

  return prisma.adviceTemplate.findMany({
    where: { doctorId: session.user.id },
    orderBy: { title: "asc" },
  });
}

export async function createAdviceTemplate(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = adviceSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const template = await prisma.adviceTemplate.create({
    data: { doctorId: session.user.id, ...parsed.data },
  });

  revalidatePath("/settings");
  return { success: true, template };
}

export async function deleteAdviceTemplate(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await prisma.adviceTemplate.deleteMany({
    where: { id, doctorId: session.user.id },
  });

  revalidatePath("/settings");
  return { success: true };
}
