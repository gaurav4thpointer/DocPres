import { getPatients } from "@/lib/actions/patients";
import { getMedicines } from "@/lib/actions/medicines";
import { getAdviceTemplates } from "@/lib/actions/advice";
import { PrescriptionEditor } from "@/components/prescriptions/prescription-editor";

export default async function NewPrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const params = await searchParams;
  const [{ patients }, medicines, adviceTemplates] = await Promise.all([
    getPatients(),
    getMedicines(),
    getAdviceTemplates(),
  ]);

  return (
    <PrescriptionEditor
      patients={patients}
      medicines={medicines}
      adviceTemplates={adviceTemplates}
      defaultPatientId={params.patientId}
    />
  );
}
