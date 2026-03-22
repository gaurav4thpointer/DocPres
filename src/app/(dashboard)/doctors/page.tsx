import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { requireClinicId } from "@/lib/auth-utils";
import { getClinicDoctors } from "@/lib/actions/admin";
import { DoctorsClient } from "./doctors-client";

export default async function DoctorsPage() {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  if (role !== UserRole.CLINIC) redirect("/dashboard");

  const clinicId = await requireClinicId();
  const doctors = await getClinicDoctors(clinicId);

  return <DoctorsClient initialDoctors={doctors} clinicId={clinicId} />;
}
