"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getMonthlyFinalizedCount,
  SUBSCRIPTION_MONTHLY_LIMITS,
  subscriptionPlanLabel,
} from "@/lib/subscription";
import { SubscriptionPlan, UserRole } from "@prisma/client";

export type ClinicSubscriptionOverview = {
  plan: SubscriptionPlan;
  planLabel: string;
  limit: number;
  usedThisMonth: number;
} | null;

/** Usage for the current IST month (by “today”), for dashboard display. */
export async function getClinicSubscriptionOverview(): Promise<ClinicSubscriptionOverview> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const clinicId = (session.user as { clinicId?: string }).clinicId;
  const role = (session.user as { role?: UserRole }).role;
  if (!clinicId || role === UserRole.ADMIN) return null;

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { subscriptionPlan: true },
  });
  if (!clinic) return null;

  const now = new Date();
  const usedThisMonth = await getMonthlyFinalizedCount(clinicId, now);
  const limit = SUBSCRIPTION_MONTHLY_LIMITS[clinic.subscriptionPlan];

  return {
    plan: clinic.subscriptionPlan,
    planLabel: subscriptionPlanLabel(clinic.subscriptionPlan),
    limit,
    usedThisMonth,
  };
}
