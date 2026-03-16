import { getPatients } from "@/lib/actions/patients";
import { PageHeader } from "@/components/layout/page-header";
import { PatientsClient } from "./patients-client";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; action?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const page = Number(params.page ?? 1);

  const { patients, total } = await getPatients(search, page);

  return (
    <PatientsClient
      patients={patients}
      total={total}
      initialSearch={search}
      page={page}
      openAdd={params.action === "add"}
    />
  );
}
