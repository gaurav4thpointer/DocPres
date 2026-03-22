import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type {
  AdminPlatformAnalytics,
  ClinicScopeAnalytics,
  DoctorScopeAnalytics,
  FollowUpSummary,
} from "@/lib/actions/analytics";
import { Building2, CalendarClock, FileText, Pill, Stethoscope, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {value.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FollowUpsPanel({
  followUps,
  showDoctorColumn,
}: {
  followUps: FollowUpSummary;
  showDoctorColumn: boolean;
}) {
  const { overdue, dueInWindow, windowDays, items } = followUps;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock className="h-4 w-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700">Follow-ups due</p>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Based on follow-up date on each prescription (IST calendar days). Table lists overdue visits and
          follow-ups in the next {windowDays} days, sorted by date (earliest first, capped at 75 rows).
        </p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-3">
            <p className="text-2xl font-bold text-rose-900">{overdue.toLocaleString()}</p>
            <p className="text-sm text-rose-800/80">Overdue</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3">
            <p className="text-2xl font-bold text-sky-900">{dueInWindow.toLocaleString()}</p>
            <p className="text-sm text-sky-800/80">Due in next {windowDays} days</p>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">No follow-up dates in this range.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/80">
                  <th className="px-3 py-2.5 font-medium">Follow-up</th>
                  <th className="px-3 py-2.5 font-medium">Patient</th>
                  {showDoctorColumn ? <th className="px-3 py-2.5 font-medium">Doctor</th> : null}
                  <th className="px-3 py-2.5 font-medium">Rx date</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium w-0" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((row) => (
                  <tr
                    key={row.prescriptionId}
                    className={row.isOverdue ? "bg-rose-50/40" : undefined}
                  >
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={row.isOverdue ? "font-medium text-rose-800" : "text-gray-900"}>
                        {formatDate(row.followUpDate)}
                      </span>
                      {row.isOverdue ? (
                        <Badge variant="warning" className="ml-2 text-[10px] px-1.5 py-0">
                          Overdue
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-gray-900">{row.patientName}</td>
                    {showDoctorColumn ? (
                      <td className="px-3 py-2.5 text-gray-600">{row.doctorName}</td>
                    ) : null}
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                      {formatDate(row.prescriptionDate)}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={row.status === "FINALIZED" ? "success" : "warning"}>
                        {row.status === "FINALIZED" ? "Final" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/prescriptions/${row.prescriptionId}`}
                        className="text-sky-600 hover:text-sky-700 font-medium text-xs whitespace-nowrap"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DailyTrend({ points }: { points: { date: string; count: number }[] }) {
  const max = Math.max(...points.map((p) => p.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-36 px-1">
      {points.map((p) => (
        <div
          key={p.date}
          className="flex-1 min-w-0 flex flex-col items-center justify-end group"
          title={`${formatDate(p.date)}: ${p.count}`}
        >
          <div
            className="w-full max-w-[10px] mx-auto rounded-t bg-sky-400/90 group-hover:bg-sky-500 transition-colors"
            style={{ height: `${Math.max(4, (p.count / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function AdminAnalyticsView({ data }: { data: AdminPlatformAnalytics }) {
  const rxTotal = data.prescriptionsByStatus.draft + data.prescriptionsByStatus.finalized;

  return (
    <div>
      <PageHeader
        title="Platform analytics"
        description="Usage across all clinics for the last 30 days (trend) and all-time totals."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Clinics" value={data.totals.clinics} icon={Building2} color="bg-sky-50 text-sky-600" />
        <StatCard label="Active clinics" value={data.totals.activeClinics} icon={Building2} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Doctors" value={data.totals.doctors} icon={Stethoscope} color="bg-violet-50 text-violet-600" />
        <StatCard label="Patients" value={data.totals.patients} icon={Users} color="bg-amber-50 text-amber-600" />
        <StatCard label="Prescriptions" value={data.totals.prescriptions} icon={FileText} color="bg-rose-50 text-rose-600" />
        <StatCard label="Medicines" value={data.totals.medicines} icon={Pill} color="bg-cyan-50 text-cyan-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-700 mb-1">Prescriptions (last 30 days)</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">{data.prescriptionsLast30Days.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mb-2">Daily finalized + draft counts by prescription date (IST)</p>
            <DailyTrend points={data.dailyPrescriptions} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">All-time by status</p>
            <StatusRow label="Draft" value={data.prescriptionsByStatus.draft} total={rxTotal} />
            <StatusRow label="Finalized" value={data.prescriptionsByStatus.finalized} total={rxTotal} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Top clinics by prescription volume</p>
          {data.topClinicsByPrescriptions.length === 0 ? (
            <p className="text-sm text-gray-400">No prescriptions yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.topClinicsByPrescriptions.map((c, i) => (
                <li key={c.id} className="flex justify-between py-2.5 text-sm first:pt-0">
                  <span className="text-gray-600">
                    <span className="text-gray-400 mr-2">{i + 1}.</span>
                    {c.name}
                  </span>
                  <span className="font-medium text-gray-900">{c.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PortalAnalyticsView({ data }: { data: ClinicScopeAnalytics | DoctorScopeAnalytics }) {
  if (data.scope === "doctor") {
    const rxTotal = data.prescriptionsByStatus.draft + data.prescriptionsByStatus.finalized;
    const typeTotal = data.prescriptionsByType.general + data.prescriptionsByType.eye;

    return (
      <div>
        <PageHeader
          title="Your reporting"
          description="Prescription volume (last 30 days and all-time), follow-ups due, and activity for your account."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Patients" value={data.totals.patients} icon={Users} color="bg-sky-50 text-sky-600" />
          <StatCard label="Prescriptions" value={data.totals.prescriptions} icon={FileText} color="bg-violet-50 text-violet-600" />
          <StatCard label="Medicines" value={data.totals.medicines} icon={Pill} color="bg-amber-50 text-amber-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-700 mb-1">Prescriptions (last 30 days)</p>
              <p className="text-2xl font-bold text-gray-900 mb-4">{data.prescriptionsLast30Days.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mb-2">By prescription date (IST)</p>
              <DailyTrend points={data.dailyPrescriptions} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">By status</p>
              <StatusRow label="Draft" value={data.prescriptionsByStatus.draft} total={rxTotal} />
              <StatusRow label="Finalized" value={data.prescriptionsByStatus.finalized} total={rxTotal} />
              <p className="text-sm font-semibold text-gray-700 pt-2">By type</p>
              <StatusRow label="General" value={data.prescriptionsByType.general} total={typeTotal} />
              <StatusRow label="Eye" value={data.prescriptionsByType.eye} total={typeTotal} />
            </CardContent>
          </Card>
        </div>
        <FollowUpsPanel followUps={data.followUps} showDoctorColumn={false} />
      </div>
    );
  }

  const rxTotal = data.prescriptionsByStatus.draft + data.prescriptionsByStatus.finalized;

  return (
    <div>
      <PageHeader
        title="Clinic reporting"
        description="Prescription volume across all doctors, follow-ups due, and per-doctor activity."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Doctors" value={data.totals.doctors} icon={Stethoscope} color="bg-sky-50 text-sky-600" />
        <StatCard label="Active doctors" value={data.totals.activeDoctors} icon={Stethoscope} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Patients" value={data.totals.patients} icon={Users} color="bg-violet-50 text-violet-600" />
        <StatCard label="Prescriptions" value={data.totals.prescriptions} icon={FileText} color="bg-amber-50 text-amber-600" />
        <StatCard label="Medicines" value={data.totals.medicines} icon={Pill} color="bg-rose-50 text-rose-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-700 mb-1">Prescriptions (last 30 days)</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">{data.prescriptionsLast30Days.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mb-2">By prescription date (IST)</p>
            <DailyTrend points={data.dailyPrescriptions} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">All-time by status</p>
            <StatusRow label="Draft" value={data.prescriptionsByStatus.draft} total={rxTotal} />
            <StatusRow label="Finalized" value={data.prescriptionsByStatus.finalized} total={rxTotal} />
          </CardContent>
        </Card>
      </div>
      <div className="mb-6">
        <FollowUpsPanel followUps={data.followUps} showDoctorColumn />
      </div>
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">By doctor</p>
          {data.byDoctor.length === 0 ? (
            <p className="text-sm text-gray-400">No doctors yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Doctor</th>
                    <th className="pb-2 font-medium text-right">Patients</th>
                    <th className="pb-2 font-medium text-right">Prescriptions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.byDoctor.map((row) => (
                    <tr key={row.doctorId}>
                      <td className="py-2.5 text-gray-900">{row.name}</td>
                      <td className="py-2.5 text-right text-gray-600">{row.patients.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-medium text-gray-900">{row.prescriptions.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
