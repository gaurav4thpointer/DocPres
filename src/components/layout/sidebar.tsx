"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Pill,
  History,
  Settings,
  Stethoscope,
  LogOut,
  PlusCircle,
  UserCog,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import type { UserRole } from "@prisma/client";
import type { LucideIcon } from "lucide-react";

const baseNavItems: {
  href: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Reporting", icon: BarChart3 },
  { href: "/prescriptions/new", label: "New Prescription", icon: PlusCircle, highlight: true },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/medicines", label: "Medicines", icon: Pill },
  { href: "/prescriptions", label: "Prescription History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

function buildNavItems(userRole?: UserRole) {
  if (userRole !== "CLINIC") return baseNavItems;
  const items = [...baseNavItems];
  const medicinesIdx = items.findIndex((i) => i.href === "/medicines");
  items.splice(medicinesIdx + 1, 0, { href: "/doctors", label: "Doctors", icon: UserCog });
  return items;
}

export function Sidebar({ userRole }: { userRole?: UserRole }) {
  const pathname = usePathname();
  const navItems = useMemo(() => buildNavItems(userRole), [userRole]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600">
          <Stethoscope className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">RxPad</p>
          <p className="text-xs text-gray-500">Prescription Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : href === "/analytics"
              ? pathname === "/analytics"
              : href === "/prescriptions/new"
              ? pathname === "/prescriptions/new"
              : href === "/medicines"
              ? pathname.startsWith("/medicines")
              : href === "/doctors"
              ? pathname.startsWith("/doctors")
              : pathname.startsWith(href) && href !== "/dashboard";

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sky-50 text-sky-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                highlight && !active && "text-sky-600 hover:bg-sky-50"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-sky-600", highlight && !active && "text-sky-500")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
