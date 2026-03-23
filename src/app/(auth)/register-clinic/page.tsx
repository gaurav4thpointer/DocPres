import { notFound } from "next/navigation";
import { RegisterClinicClient } from "./register-clinic-client";

export const dynamic = "force-dynamic";

export default function RegisterClinicPage() {
  if (process.env.ALLOW_CLINIC_SELF_ONBOARDING !== "true") {
    notFound();
  }
  return <RegisterClinicClient />;
}
