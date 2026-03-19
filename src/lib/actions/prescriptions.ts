"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { MedicineTiming, PrescriptionStatus, PrescriptionType, Prisma } from "@prisma/client";

const prescriptionItemSchema = z.object({
  medicineId: z.string().optional().nullable(),
  medicineName: z.string().min(1),
  strength: z.string().optional().nullable(),
  dosage: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  timing: z.nativeEnum(MedicineTiming).optional().nullable(),
  route: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().optional(),
  prescriptionDate: z.string(),
  prescriptionType: z.nativeEnum(PrescriptionType).default(PrescriptionType.GENERAL),
  chiefComplaints: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  clinicalNotes: z.string().optional().nullable(),
  investigations: z.string().optional().nullable(),
  generalAdvice: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  templateData: z.any().optional().nullable(),
  status: z.nativeEnum(PrescriptionStatus).default(PrescriptionStatus.DRAFT),
  items: z.array(prescriptionItemSchema),
});

export async function getPrescriptions(opts?: {
  search?: string;
  status?: PrescriptionStatus;
  page?: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { prescriptions: [], total: 0 };
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) return { prescriptions: [], total: 0 };

  const { search, status, page = 1, limit = 20 } = opts ?? {};

  const where = {
    clinicId,
    ...(role === "DOCTOR" && { doctorId: session.user.id }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { patient: { fullName: { contains: search, mode: "insensitive" as const } } },
        { patient: { mobile: { contains: search } } },
        { diagnosis: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [prescriptions, total] = await Promise.all([
    prisma.prescription.findMany({
      where,
      include: {
        patient: { select: { id: true, fullName: true, age: true, gender: true, mobile: true } },
        items: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { prescriptionDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.prescription.count({ where }),
  ]);

  return { prescriptions, total };
}

export async function getPrescription(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) return null;

  return prisma.prescription.findFirst({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
    },
    include: {
      patient: true,
      items: { orderBy: { sortOrder: "asc" } },
      doctor: { include: { clinicSettings: true } },
    },
  });
}

export async function createPrescription(data: z.infer<typeof prescriptionSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) throw new Error("No clinic context");

  let doctorId = session.user.id;
  if (role === "CLINIC") {
    const doctor = data.doctorId
      ? await prisma.doctor.findFirst({
          where: { id: data.doctorId, clinicId },
          select: { id: true },
        })
      : await prisma.doctor.findFirst({
          where: { clinicId },
          select: { id: true },
        });
    if (!doctor) throw new Error("Clinic has no doctors. Add a doctor first.");
    doctorId = doctor.id;
  }

  const parsed = prescriptionSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { items, ...prescriptionData } = parsed.data;

  const prescription = await prisma.prescription.create({
    data: {
      clinicId,
      doctorId,
      ...prescriptionData,
      prescriptionDate: new Date(prescriptionData.prescriptionDate),
      followUpDate: prescriptionData.followUpDate ? new Date(prescriptionData.followUpDate) : null,
      templateData: prescriptionData.templateData ?? null,
      items: {
        create: items.map((item, i) => ({ ...item, sortOrder: i })),
      },
    },
    include: { items: true },
  });

  revalidatePath("/prescriptions");
  revalidatePath("/dashboard");
  return { success: true, prescription };
}

export async function updatePrescription(id: string, data: z.infer<typeof prescriptionSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) throw new Error("No clinic context");

  const existing = await prisma.prescription.findFirst({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
    },
  });
  if (!existing) throw new Error("Prescription not found");
  if (existing.status === PrescriptionStatus.FINALIZED) {
    throw new Error("Finalized prescriptions cannot be edited");
  }

  const parsed = prescriptionSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const { items, doctorId: _doctorId, ...prescriptionData } = parsed.data;

  const prescription = await prisma.prescription.update({
    where: { id },
    data: {
      ...prescriptionData,
      prescriptionDate: new Date(prescriptionData.prescriptionDate),
      followUpDate: prescriptionData.followUpDate ? new Date(prescriptionData.followUpDate) : null,
      templateData: prescriptionData.templateData ?? null,
      items: {
        deleteMany: {},
        create: items.map((item, i) => ({ ...item, sortOrder: i })),
      },
    },
    include: { items: true },
  });

  revalidatePath("/prescriptions");
  revalidatePath(`/prescriptions/${id}`);
  return { success: true, prescription };
}

export async function finalizePrescription(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) throw new Error("No clinic context");

  await prisma.prescription.updateMany({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
      status: PrescriptionStatus.DRAFT,
    },
    data: { status: PrescriptionStatus.FINALIZED },
  });

  revalidatePath("/prescriptions");
  revalidatePath(`/prescriptions/${id}`);
  return { success: true };
}

export async function duplicatePrescription(id: string) {
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
    if (!firstDoctor) throw new Error("Clinic has no doctors.");
    doctorId = firstDoctor.id;
  }

  const original = await prisma.prescription.findFirst({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
    },
    include: { items: true },
  });
  if (!original) throw new Error("Prescription not found");

  const duplicate = await prisma.prescription.create({
    data: {
      clinicId,
      doctorId,
      patientId: original.patientId,
      status: PrescriptionStatus.DRAFT,
      prescriptionType: original.prescriptionType,
      prescriptionDate: new Date(),
      chiefComplaints: original.chiefComplaints,
      diagnosis: original.diagnosis,
      clinicalNotes: original.clinicalNotes,
      investigations: original.investigations,
      generalAdvice: original.generalAdvice,
      followUpDate: null,
      internalNotes: null,
      templateData: original.templateData ?? Prisma.JsonNull,
      items: {
        create: original.items.map((item) => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          strength: item.strength,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          timing: item.timing,
          route: item.route,
          instructions: item.instructions,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  revalidatePath("/prescriptions");
  return { success: true, prescription: duplicate };
}

export async function deletePrescription(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) throw new Error("No clinic context");

  const existing = await prisma.prescription.findFirst({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
    },
  });
  if (existing?.status === PrescriptionStatus.FINALIZED) {
    throw new Error("Cannot delete a finalized prescription");
  }

  await prisma.prescription.deleteMany({
    where: {
      id,
      clinicId,
      ...(role === "DOCTOR" && { doctorId: session.user.id }),
      status: PrescriptionStatus.DRAFT,
    },
  });

  revalidatePath("/prescriptions");
  return { success: true };
}

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: string }).role;
  if (!clinicId) return null;

  const baseWhere = {
    clinicId,
    ...(role === "DOCTOR" && { doctorId: session.user.id }),
  };

  const [totalPatients, totalPrescriptions, recentPatients, recentPrescriptions] =
    await Promise.all([
      prisma.patient.count({ where: baseWhere }),
      prisma.prescription.count({ where: baseWhere }),
      prisma.patient.findMany({
        where: baseWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.prescription.findMany({
        where: baseWhere,
        include: { patient: { select: { fullName: true } } },
        orderBy: { prescriptionDate: "desc" },
        take: 5,
      }),
    ]);

  return { totalPatients, totalPrescriptions, recentPatients, recentPrescriptions };
}
