import { getDashboardStats } from "@/lib/actions/prescriptions";
import { getDoctorProfile } from "@/lib/actions/doctor";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  FileText,
  PlusCircle,
  UserPlus,
  Pill,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default async function DashboardPage() {
  const [stats, doctor] = await Promise.all([
    getDashboardStats(),
    getDoctorProfile(),
  ]);

  const statCards = [
    {
      label: "Total Patients",
      value: stats?.totalPatients ?? 0,
      icon: Users,
      color: "bg-sky-50 text-sky-600",
    },
    {
      label: "Total Prescriptions",
      value: stats?.totalPrescriptions ?? 0,
      icon: FileText,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Good morning, Dr. ${doctor?.name ?? "Doctor"}`}
        description="Here's what's happening at your clinic today"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/prescriptions/new">
              <Button size="sm">
                <PlusCircle className="h-4 w-4" />
                New Prescription
              </Button>
            </Link>
            <Link href="/patients?action=add">
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4" />
                Add Patient
              </Button>
            </Link>
            <Link href="/medicines">
              <Button variant="outline" size="sm">
                <Pill className="h-4 w-4" />
                Manage Medicines
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Patients */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">Recent Patients</p>
              </div>
              <Link href="/patients">
                <Button variant="ghost" size="sm" className="text-xs text-sky-600">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.recentPatients?.length === 0 && (
                <p className="px-5 py-6 text-sm text-gray-400 text-center">No patients yet</p>
              )}
              {stats?.recentPatients?.map((p) => (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {p.gender} · {p.age ? `${p.age} yrs` : "Age not set"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">Recent Prescriptions</p>
              </div>
              <Link href="/prescriptions">
                <Button variant="ghost" size="sm" className="text-xs text-sky-600">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.recentPrescriptions?.length === 0 && (
                <p className="px-5 py-6 text-sm text-gray-400 text-center">No prescriptions yet</p>
              )}
              {stats?.recentPrescriptions?.map((rx) => (
                <Link
                  key={rx.id}
                  href={`/prescriptions/${rx.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rx.patient.fullName}</p>
                    <p className="text-xs text-gray-500">{formatDate(rx.prescriptionDate)}</p>
                  </div>
                  <Badge variant={rx.status === "FINALIZED" ? "success" : "warning"}>
                    {rx.status === "FINALIZED" ? "Final" : "Draft"}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
