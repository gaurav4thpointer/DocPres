import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function getSessionClinicId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.clinicId) return null;
  return session.user.clinicId;
}

export async function requireClinicId(): Promise<string> {
  const clinicId = await getSessionClinicId();
  if (!clinicId) throw new Error("Not authenticated or no clinic context");
  return clinicId;
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function requireUserId(): Promise<string> {
  const id = await getSessionUserId();
  if (!id) throw new Error("Not authenticated");
  return id;
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return (session?.user as { role?: UserRole })?.role === UserRole.ADMIN;
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) throw new Error("Admin access required");
}

/** Clinic or doctor sessions only — platform admin has no tenant. */
export async function requireClinicScope(): Promise<{
  clinicId: string;
  userId: string;
  role: UserRole;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  const role = session.user.role;
  if (role === UserRole.ADMIN) throw new Error("Access denied");
  const clinicId = session.user.clinicId;
  if (!clinicId) throw new Error("No clinic context");
  return { clinicId, userId: session.user.id, role };
}
