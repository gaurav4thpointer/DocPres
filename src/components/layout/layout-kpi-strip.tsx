import Link from "next/link";
import { getAdminLayoutKpis, getPortalLayoutKpis } from "@/lib/actions/analytics";

function KpiItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900 tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}

export async function PortalLayoutKpiStrip() {
  const data = await getPortalLayoutKpis();
  if (!data) return null;

  const items =
    data.scope === "doctor"
      ? [
          { label: "Patients", value: data.patients },
          { label: "Prescriptions", value: data.prescriptions },
          { label: "Medicines", value: data.medicines },
          { label: "Prescriptions (30d)", value: data.prescriptionsLast30Days },
        ]
      : [
          { label: "Doctors", value: data.doctors },
          { label: "Patients", value: data.patients },
          { label: "Prescriptions", value: data.prescriptions },
          { label: "Medicines", value: data.medicines },
          { label: "Prescriptions (30d)", value: data.prescriptionsLast30Days },
        ];

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-2">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {items.map((item) => (
          <KpiItem key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
      <Link
        href="/analytics"
        className="text-sm font-medium text-sky-600 hover:text-sky-700 shrink-0"
      >
        View analytics →
      </Link>
    </div>
  );
}

export async function AdminLayoutKpiStrip() {
  const data = await getAdminLayoutKpis();
  if (!data) return null;

  const items = [
    { label: "Clinics", value: data.clinics },
    { label: "Doctors", value: data.doctors },
    { label: "Patients", value: data.patients },
    { label: "Prescriptions", value: data.prescriptions },
  ];

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-2">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {items.map((item) => (
          <KpiItem key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
      <Link
        href="/admin/analytics"
        className="text-sm font-medium text-sky-600 hover:text-sky-700 shrink-0"
      >
        View analytics →
      </Link>
    </div>
  );
}
