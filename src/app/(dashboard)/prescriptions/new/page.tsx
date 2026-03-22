import { getPatients } from "@/lib/actions/patients";
import { getMedicines } from "@/lib/actions/medicines";
import { getAdviceTemplates } from "@/lib/actions/advice";
import { getDoctorsForPrescription } from "@/lib/actions/doctor";
import { PrescriptionEditor } from "@/components/prescriptions/prescription-editor";
import { formatInAppTimezone } from "@/lib/timezone";

export default async function NewPrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const params = await searchParams;
  const [{ patients }, medicines, adviceTemplates, doctors] = await Promise.all([
    getPatients(),
    getMedicines(),
    getAdviceTemplates(),
    getDoctorsForPrescription(),
  ]);

  return (
    <PrescriptionEditor
      patients={patients}
      medicines={medicines}
      adviceTemplates={adviceTemplates}
      doctors={doctors}
      defaultPatientId={params.patientId}
      defaultPrescriptionDate={formatInAppTimezone(new Date(), "yyyy-MM-dd")}
    />
  );
}
