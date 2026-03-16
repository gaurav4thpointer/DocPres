import { getMedicines } from "@/lib/actions/medicines";
import { MedicinesClient } from "./medicines-client";

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const medicines = await getMedicines(params.search);
  return <MedicinesClient medicines={medicines} initialSearch={params.search ?? ""} />;
}
