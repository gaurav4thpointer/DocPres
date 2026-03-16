import { getDoctorProfile } from "@/lib/actions/doctor";
import { getAdviceTemplates } from "@/lib/actions/advice";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const [doctor, adviceTemplates] = await Promise.all([
    getDoctorProfile(),
    getAdviceTemplates(),
  ]);

  return <SettingsClient doctor={doctor} adviceTemplates={adviceTemplates} />;
}
