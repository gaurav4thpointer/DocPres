"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appCalendarYmd, startOfAppDay } from "@/lib/timezone";
import { PrescriptionStatus, PrescriptionType, UserRole } from "@prisma/client";
import { subDays } from "date-fns";

const TREND_DAYS = 30;

const FOLLOW_UP_WINDOW_DAYS = 14;
const FOLLOW_UP_LIST_LIMIT = 75;

export type FollowUpListRow = {
  prescriptionId: string;
  followUpDate: string;
  prescriptionDate: string;
  status: PrescriptionStatus;
  patientName: string;
  doctorName: string;
  isOverdue: boolean;
};

export type FollowUpSummary = {
  overdue: number;
  dueInWindow: number;
  windowDays: number;
  items: FollowUpListRow[];
};

type FollowUpWhere = { clinicId: string; doctorId?: string };

async function getFollowUpAnalytics(where: FollowUpWhere): Promise<FollowUpSummary> {
  const startToday = startOfAppDay(new Date());
  const windowEnd = new Date(startToday.getTime() + FOLLOW_UP_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [overdue, dueInWindow, listRows] = await Promise.all([
    prisma.prescription.count({
      where: { ...where, followUpDate: { lt: startToday } },
    }),
    prisma.prescription.count({
      where: { ...where, followUpDate: { gte: startToday, lt: windowEnd } },
    }),
    prisma.prescription.findMany({
      where: {
        ...where,
        OR: [
          { followUpDate: { lt: startToday } },
          { followUpDate: { gte: startToday, lt: windowEnd } },
        ],
      },
      orderBy: { followUpDate: "asc" },
      take: FOLLOW_UP_LIST_LIMIT,
      select: {
        id: true,
        followUpDate: true,
        prescriptionDate: true,
        status: true,
        patient: { select: { fullName: true } },
        doctor: { select: { name: true } },
      },
    }),
  ]);

  const items = listRows.map((r) => {
    const fu = r.followUpDate!;
    return {
      prescriptionId: r.id,
      followUpDate: fu.toISOString(),
      prescriptionDate: r.prescriptionDate.toISOString(),
      status: r.status,
      patientName: r.patient.fullName,
      doctorName: r.doctor.name,
      isOverdue: fu < startToday,
    };
  });

  return { overdue, dueInWindow, windowDays: FOLLOW_UP_WINDOW_DAYS, items };
}

function buildDailyBuckets(
  rows: { prescriptionDate: Date }[],
  days: number
): { date: string; count: number }[] {
  const keys: string[] = [];
  const todayStart = startOfAppDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
    keys.push(appCalendarYmd(dayStart));
  }
  const map = new Map(keys.map((k) => [k, 0]));
  for (const row of rows) {
    const key = appCalendarYmd(new Date(row.prescriptionDate));
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return keys.map((date) => ({ date, count: map.get(date) ?? 0 }));
}

async function prescriptionsInRange(where: object, since: Date) {
  return prisma.prescription.findMany({
    where: { ...where, prescriptionDate: { gte: since } },
    select: { prescriptionDate: true },
  });
}

export type AdminPlatformAnalytics = {
  totals: {
    clinics: number;
    activeClinics: number;
    doctors: number;
    activeDoctors: number;
    patients: number;
    prescriptions: number;
    medicines: number;
  };
  prescriptionsByStatus: { draft: number; finalized: number };
  prescriptionsLast30Days: number;
  dailyPrescriptions: { date: string; count: number }[];
  topClinicsByPrescriptions: { id: string; name: string; count: number }[];
};

export async function getAdminPlatformAnalytics(): Promise<AdminPlatformAnalytics | null> {
  const session = await auth();
  if ((session?.user as { role?: UserRole })?.role !== UserRole.ADMIN) return null;

  const since = subDays(startOfAppDay(new Date()), TREND_DAYS);

  const [
    clinics,
    activeClinics,
    doctors,
    activeDoctors,
    patients,
    prescriptions,
    medicines,
    draftCount,
    finalizedCount,
    recentRxRows,
    topGroups,
  ] = await Promise.all([
    prisma.clinic.count(),
    prisma.clinic.count({ where: { isActive: true } }),
    prisma.doctor.count(),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.patient.count(),
    prisma.prescription.count(),
    prisma.medicine.count(),
    prisma.prescription.count({ where: { status: PrescriptionStatus.DRAFT } }),
    prisma.prescription.count({ where: { status: PrescriptionStatus.FINALIZED } }),
    prisma.prescription.findMany({
      where: { prescriptionDate: { gte: since } },
      select: { prescriptionDate: true },
    }),
    prisma.prescription.groupBy({
      by: ["clinicId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
  ]);

  const clinicIds = topGroups.map((g) => g.clinicId);
  const clinicRows =
    clinicIds.length > 0
      ? await prisma.clinic.findMany({
          where: { id: { in: clinicIds } },
          select: { id: true, name: true },
        })
      : [];
  const nameById = new Map(clinicRows.map((c) => [c.id, c.name]));

  return {
    totals: {
      clinics,
      activeClinics,
      doctors,
      activeDoctors,
      patients,
      prescriptions,
      medicines,
    },
    prescriptionsByStatus: { draft: draftCount, finalized: finalizedCount },
    prescriptionsLast30Days: recentRxRows.length,
    dailyPrescriptions: buildDailyBuckets(recentRxRows, TREND_DAYS),
    topClinicsByPrescriptions: topGroups.map((g) => ({
      id: g.clinicId,
      name: nameById.get(g.clinicId) ?? "Clinic",
      count: g._count.id,
    })),
  };
}

export type ClinicScopeAnalytics = {
  scope: "clinic";
  totals: {
    doctors: number;
    activeDoctors: number;
    patients: number;
    prescriptions: number;
    medicines: number;
  };
  prescriptionsByStatus: { draft: number; finalized: number };
  prescriptionsLast30Days: number;
  dailyPrescriptions: { date: string; count: number }[];
  followUps: FollowUpSummary;
  byDoctor: {
    doctorId: string;
    name: string;
    prescriptions: number;
    patients: number;
  }[];
};

export type DoctorScopeAnalytics = {
  scope: "doctor";
  totals: {
    patients: number;
    prescriptions: number;
    medicines: number;
  };
  prescriptionsByStatus: { draft: number; finalized: number };
  prescriptionsByType: { general: number; eye: number };
  prescriptionsLast30Days: number;
  dailyPrescriptions: { date: string; count: number }[];
  followUps: FollowUpSummary;
};

export async function getClinicScopeAnalytics(): Promise<ClinicScopeAnalytics | DoctorScopeAnalytics | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: UserRole }).role;
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  if (!clinicId || role === UserRole.ADMIN) return null;

  const since = subDays(startOfAppDay(new Date()), TREND_DAYS);

  const baseWhere = { clinicId };

  if (role === UserRole.DOCTOR) {
    const doctorWhere = { ...baseWhere, doctorId: session.user.id };
    const [
      patients,
      prescriptions,
      medicines,
      draftCount,
      finalizedCount,
      generalCount,
      eyeCount,
      recentRows,
      followUps,
    ] = await Promise.all([
      prisma.patient.count({ where: doctorWhere }),
      prisma.prescription.count({ where: doctorWhere }),
      prisma.medicine.count({ where: doctorWhere }),
      prisma.prescription.count({ where: { ...doctorWhere, status: PrescriptionStatus.DRAFT } }),
      prisma.prescription.count({ where: { ...doctorWhere, status: PrescriptionStatus.FINALIZED } }),
      prisma.prescription.count({ where: { ...doctorWhere, prescriptionType: PrescriptionType.GENERAL } }),
      prisma.prescription.count({ where: { ...doctorWhere, prescriptionType: PrescriptionType.EYE } }),
      prescriptionsInRange(doctorWhere, since),
      getFollowUpAnalytics({ clinicId, doctorId: session.user.id }),
    ]);

    return {
      scope: "doctor",
      totals: { patients, prescriptions, medicines },
      prescriptionsByStatus: { draft: draftCount, finalized: finalizedCount },
      prescriptionsByType: { general: generalCount, eye: eyeCount },
      prescriptionsLast30Days: recentRows.length,
      dailyPrescriptions: buildDailyBuckets(recentRows, TREND_DAYS),
      followUps,
    };
  }

  // CLINIC
  const [
    doctors,
    activeDoctors,
    patients,
    prescriptions,
    medicines,
    draftCount,
    finalizedCount,
    recentRows,
    rxByDoctor,
    patientsByDoctor,
    followUps,
  ] = await Promise.all([
    prisma.doctor.count({ where: baseWhere }),
    prisma.doctor.count({ where: { ...baseWhere, isActive: true } }),
    prisma.patient.count({ where: baseWhere }),
    prisma.prescription.count({ where: baseWhere }),
    prisma.medicine.count({ where: baseWhere }),
    prisma.prescription.count({ where: { ...baseWhere, status: PrescriptionStatus.DRAFT } }),
    prisma.prescription.count({ where: { ...baseWhere, status: PrescriptionStatus.FINALIZED } }),
    prescriptionsInRange(baseWhere, since),
    prisma.prescription.groupBy({
      by: ["doctorId"],
      where: baseWhere,
      _count: { id: true },
    }),
    prisma.patient.groupBy({
      by: ["doctorId"],
      where: baseWhere,
      _count: { id: true },
    }),
    getFollowUpAnalytics({ clinicId }),
  ]);

  const doctorIds = [...new Set([...rxByDoctor.map((g) => g.doctorId), ...patientsByDoctor.map((g) => g.doctorId)])];
  const doctorRows =
    doctorIds.length > 0
      ? await prisma.doctor.findMany({
          where: { id: { in: doctorIds }, clinicId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [];

  const rxMap = new Map(rxByDoctor.map((g) => [g.doctorId, g._count.id]));
  const ptMap = new Map(patientsByDoctor.map((g) => [g.doctorId, g._count.id]));

  const byDoctor = doctorRows.map((d) => ({
    doctorId: d.id,
    name: d.name,
    prescriptions: rxMap.get(d.id) ?? 0,
    patients: ptMap.get(d.id) ?? 0,
  }));

  byDoctor.sort((a, b) => b.prescriptions - a.prescriptions);

  return {
    scope: "clinic",
    totals: { doctors, activeDoctors, patients, prescriptions, medicines },
    prescriptionsByStatus: { draft: draftCount, finalized: finalizedCount },
    prescriptionsLast30Days: recentRows.length,
    dailyPrescriptions: buildDailyBuckets(recentRows, TREND_DAYS),
    followUps,
    byDoctor,
  };
}

/** Compact counts for the portal shell (doctor / clinic manager). Uses efficient aggregates only. */
export type PortalLayoutKpis =
  | {
      scope: "doctor";
      patients: number;
      prescriptions: number;
      medicines: number;
      prescriptionsLast30Days: number;
    }
  | {
      scope: "clinic";
      doctors: number;
      patients: number;
      prescriptions: number;
      medicines: number;
      prescriptionsLast30Days: number;
    };

export async function getPortalLayoutKpis(): Promise<PortalLayoutKpis | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: UserRole }).role;
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  if (!clinicId || role === UserRole.ADMIN) return null;

  const since = subDays(startOfAppDay(new Date()), TREND_DAYS);

  const baseWhere = { clinicId };

  if (role === UserRole.DOCTOR) {
    const doctorWhere = { ...baseWhere, doctorId: session.user.id };
    const [patients, prescriptions, medicines, prescriptionsLast30Days] = await Promise.all([
      prisma.patient.count({ where: doctorWhere }),
      prisma.prescription.count({ where: doctorWhere }),
      prisma.medicine.count({ where: doctorWhere }),
      prisma.prescription.count({
        where: { ...doctorWhere, prescriptionDate: { gte: since } },
      }),
    ]);
    return { scope: "doctor", patients, prescriptions, medicines, prescriptionsLast30Days };
  }

  const [doctors, patients, prescriptions, medicines, prescriptionsLast30Days] = await Promise.all([
    prisma.doctor.count({ where: baseWhere }),
    prisma.patient.count({ where: baseWhere }),
    prisma.prescription.count({ where: baseWhere }),
    prisma.medicine.count({ where: baseWhere }),
    prisma.prescription.count({
      where: { ...baseWhere, prescriptionDate: { gte: since } },
    }),
  ]);

  return { scope: "clinic", doctors, patients, prescriptions, medicines, prescriptionsLast30Days };
}

export type AdminLayoutKpis = {
  clinics: number;
  doctors: number;
  patients: number;
  prescriptions: number;
};

export async function getAdminLayoutKpis(): Promise<AdminLayoutKpis | null> {
  const session = await auth();
  if ((session?.user as { role?: UserRole })?.role !== UserRole.ADMIN) return null;

  const [clinics, doctors, patients, prescriptions] = await Promise.all([
    prisma.clinic.count(),
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.prescription.count(),
  ]);

  return { clinics, doctors, patients, prescriptions };
}
