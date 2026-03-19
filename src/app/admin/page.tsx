import { getClinics } from "@/lib/actions/admin";
import { AdminClinicsClient } from "./admin-clinics-client";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const { clinics, total } = await getClinics(search);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Clinics</h1>
      <p className="text-gray-500 mb-6">Manage clinics, import new ones, reset passwords, and login as clinic.</p>
      <AdminClinicsClient initialClinics={clinics} total={total} />
    </div>
  );
}
