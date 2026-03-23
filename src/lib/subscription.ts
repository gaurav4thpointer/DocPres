import { PrescriptionStatus, SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { startOfAppMonth, startOfNextAppMonth } from "@/lib/timezone";

export const SUBSCRIPTION_MONTHLY_LIMITS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.DEMO]: 50,
  [SubscriptionPlan.STARTER]: 2_000,
  [SubscriptionPlan.GROWTH]: 10_000,
  [SubscriptionPlan.SCALE]: 50_000,
};

export function subscriptionPlanLabel(plan: SubscriptionPlan): string {
  const labels: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.DEMO]: "Demo",
    [SubscriptionPlan.STARTER]: "Starter",
    [SubscriptionPlan.GROWTH]: "Growth",
    [SubscriptionPlan.SCALE]: "Scale",
  };
  return labels[plan];
}

/** Finalized prescriptions for the clinic whose `prescriptionDate` falls in the IST month of `refDate`. */
export async function getMonthlyFinalizedCount(clinicId: string, refDate: Date): Promise<number> {
  const monthStart = startOfAppMonth(refDate);
  const monthEndExclusive = startOfNextAppMonth(refDate);
  return prisma.prescription.count({
    where: {
      clinicId,
      status: PrescriptionStatus.FINALIZED,
      prescriptionDate: {
        gte: monthStart,
        lt: monthEndExclusive,
      },
    },
  });
}

/**
 * Ensures the clinic may add one more finalized prescription in the IST month of `prescriptionDate`.
 * @throws Error when the monthly cap is reached.
 */
export async function assertClinicCanFinalizePrescription(
  clinicId: string,
  prescriptionDate: Date
): Promise<void> {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { subscriptionPlan: true },
  });
  if (!clinic) throw new Error("Clinic not found");

  const limit = SUBSCRIPTION_MONTHLY_LIMITS[clinic.subscriptionPlan];
  const used = await getMonthlyFinalizedCount(clinicId, prescriptionDate);
  if (used >= limit) {
    throw new Error(
      `Monthly prescription limit reached for this prescription date (${used}/${limit} finalized in that month). Contact support to upgrade your plan.`
    );
  }
}
