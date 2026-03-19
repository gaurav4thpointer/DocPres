import { auth } from "@/lib/auth";
import { getDoctorProfile } from "@/lib/actions/doctor";
import { getAdviceTemplates } from "@/lib/actions/advice";
import { SettingsClient } from "./settings-client";
import { UserRole } from "@prisma/client";

export default async function SettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;
  const [doctor, adviceTemplates] = await Promise.all([
    getDoctorProfile(),
    getAdviceTemplates(),
  ]);

  return (
    <SettingsClient
      doctor={doctor}
      adviceTemplates={adviceTemplates}
      isClinic={role === UserRole.CLINIC}
    />
  );
}
