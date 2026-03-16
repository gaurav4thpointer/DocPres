import { getPrescriptions } from "@/lib/actions/prescriptions";
import { PrescriptionsClient } from "./prescriptions-client";
import { PrescriptionStatus } from "@prisma/client";

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as PrescriptionStatus | undefined;
  const page = Number(params.page ?? 1);

  const { prescriptions, total } = await getPrescriptions({
    search: params.search,
    status,
    page,
  });

  return (
    <PrescriptionsClient
      prescriptions={prescriptions as Parameters<typeof PrescriptionsClient>[0]["prescriptions"]}
      total={total}
      initialSearch={params.search ?? ""}
      initialStatus={status}
      page={page}
    />
  );
}
