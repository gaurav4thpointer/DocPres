"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeClinicSlug } from "@/lib/clinic-slug";

async function allocateUniqueSlug(base: string): Promise<string> {
  let slug = base;
  for (let attempt = 0; attempt < 24; attempt++) {
    const taken = await prisma.clinic.findUnique({ where: { slug } });
    if (!taken) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }
  throw new Error("Could not generate a unique clinic URL slug. Try a different slug.");
}

const registerClinicSelfSchema = z.object({
  clinicName: z.string().min(1, "Clinic name is required"),
  clinicEmail: z.string().email("Valid clinic email required"),
  clinicPassword: z.string().min(6, "Clinic password must be at least 6 characters"),
});

export type RegisterClinicSelfResult = { success: true } | { success: false; error: string };

export async function registerClinicSelfService(formData: FormData): Promise<RegisterClinicSelfResult> {
  if (process.env.ALLOW_CLINIC_SELF_ONBOARDING !== "true") {
    return { success: false, error: "Clinic self-registration is not available." };
  }

  const slugFromName = normalizeClinicSlug(formData.get("clinicName"));
  const baseSlug = slugFromName;

  if (!baseSlug || baseSlug.length < 2) {
    return {
      success: false,
      error: "Use a clinic name we can turn into a short URL ID (at least 2 letters or numbers).",
    };
  }

  if (!/^[a-z0-9-]+$/.test(baseSlug)) {
    return {
      success: false,
      error: "Slug must contain only lowercase letters, numbers, and hyphens.",
    };
  }

  const raw = {
    clinicName: formData.get("clinicName"),
    clinicEmail: formData.get("clinicEmail"),
    clinicPassword: formData.get("clinicPassword"),
  };

  const parsed = registerClinicSelfSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const clinicEmail = parsed.data.clinicEmail.trim().toLowerCase();

  const existingByEmail = await prisma.clinic.findFirst({
    where: { email: { equals: clinicEmail, mode: "insensitive" } },
  });
  if (existingByEmail) {
    return { success: false, error: "An account with this clinic email already exists." };
  }

  let slug: string;
  try {
    slug = await allocateUniqueSlug(baseSlug);
  } catch {
    return { success: false, error: "Could not generate a unique clinic URL slug. Try a different slug." };
  }

  const clinicPasswordHash = await bcrypt.hash(parsed.data.clinicPassword, 12);

  try {
    await prisma.clinic.create({
      data: {
        name: parsed.data.clinicName.trim(),
        slug,
        email: clinicEmail,
        password: clinicPasswordHash,
        address: null,
        phone: null,
      },
    });
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code?: string }).code : undefined;
    if (code === "P2002") {
      return { success: false, error: "Clinic with this email or slug already exists." };
    }
    throw err;
  }

  return { success: true };
}
