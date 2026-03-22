import { AdminLayoutKpiStrip } from "@/components/layout/layout-kpi-strip";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Shield, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: UserRole })?.role;

  if (!session) {
    redirect("/admin/login");
  }
  if (role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 gap-8">
            <div className="flex items-center gap-8 min-w-0">
              <Link href="/admin" className="flex items-center gap-2 shrink-0">
                <Shield className="h-5 w-5 text-slate-700" />
                <span className="font-semibold text-gray-900">RxPad Admin</span>
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  Clinics
                </Link>
                <Link
                  href="/admin/analytics"
                  className="rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  Analytics
                </Link>
              </nav>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminLayoutKpiStrip />
        {children}
      </main>
    </div>
  );
}
