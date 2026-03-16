import { Sidebar } from "@/components/layout/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-[240px] flex-1 p-8 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
