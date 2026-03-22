import { PortalLayoutKpiStrip } from "@/components/layout/layout-kpi-strip";
import { Sidebar } from "@/components/layout/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const userRole = (session.user as { role?: UserRole }).role;
  if (userRole === UserRole.ADMIN) redirect("/admin");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <main className="ml-[240px] flex-1 p-8 max-w-full overflow-x-hidden">
        <PortalLayoutKpiStrip />
        {children}
      </main>
    </div>
  );
}
