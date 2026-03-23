import { LoginClient } from "./login-client";

type Props = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const showClinicRegistration = process.env.ALLOW_CLINIC_SELF_ONBOARDING === "true";
  const params = await searchParams;
  const justRegistered = params.registered === "1";
  return (
    <LoginClient showClinicRegistration={showClinicRegistration} justRegistered={justRegistered} />
  );
}
