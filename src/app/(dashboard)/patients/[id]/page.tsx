import { getPatient } from "@/lib/actions/patients";
import { notFound } from "next/navigation";
import { PatientDetailClient } from "./patient-detail-client";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  return <PatientDetailClient patient={patient} />;
}
