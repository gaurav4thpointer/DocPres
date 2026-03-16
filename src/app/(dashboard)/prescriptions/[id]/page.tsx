import { getPrescription } from "@/lib/actions/prescriptions";
import { getPatients } from "@/lib/actions/patients";
import { getMedicines } from "@/lib/actions/medicines";
import { getAdviceTemplates } from "@/lib/actions/advice";
import { notFound } from "next/navigation";
import { PrescriptionDetailClient } from "./prescription-detail-client";

export default async function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [prescription, { patients }, medicines, adviceTemplates] = await Promise.all([
    getPrescription(id),
    getPatients(),
    getMedicines(),
    getAdviceTemplates(),
  ]);

  if (!prescription) notFound();

  return (
    <PrescriptionDetailClient
      prescription={prescription}
      patients={patients}
      medicines={medicines}
      adviceTemplates={adviceTemplates}
    />
  );
}
