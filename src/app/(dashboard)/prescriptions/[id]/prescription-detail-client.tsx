"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Prescription, PrescriptionItem, Patient, Doctor, ClinicSettings, Medicine, AdviceTemplate } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrescriptionEditor } from "@/components/prescriptions/prescription-editor";
import { EyePrescriptionSection } from "@/components/prescriptions/eye-prescription-section";
import { finalizePrescription, duplicatePrescription } from "@/lib/actions/prescriptions";
import { useToast } from "@/components/ui/toaster";
import { formatDate, MEDICINE_TIMINGS } from "@/lib/utils";
import { parseEyeTemplateData, hasEyeData } from "@/lib/prescription-templates/eye";
import { PRESCRIPTION_TYPE_CONFIG } from "@/lib/prescription-types";
import { ArrowLeft, Printer, Copy, Edit2, CheckCircle2, Lock, Eye, Stethoscope } from "lucide-react";
import Link from "next/link";

type FullPrescription = Prescription & {
  patient: Patient;
  items: PrescriptionItem[];
  doctor: Doctor & { clinicSettings: ClinicSettings | null };
};

interface Props {
  prescription: FullPrescription;
  patients: Patient[];
  medicines: Medicine[];
  adviceTemplates: AdviceTemplate[];
}

export function PrescriptionDetailClient({ prescription, patients, medicines, adviceTemplates }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);

  const isFinalized = prescription.status === "FINALIZED";
  const isEye = prescription.prescriptionType === "EYE";
  const eyeData = parseEyeTemplateData(prescription.templateData);
  const typeConfig = PRESCRIPTION_TYPE_CONFIG[prescription.prescriptionType ?? "GENERAL"];

  const handleFinalize = async () => {
    if (!confirm("Finalize this prescription? It will be locked.")) return;
    try {
      await finalizePrescription(prescription.id);
      toast("Prescription finalized", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleDuplicate = async () => {
    try {
      const result = await duplicatePrescription(prescription.id);
      toast("Prescription duplicated", "success");
      router.push(`/prescriptions/${result.prescription.id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const timingLabel = (t: string | null) =>
    MEDICINE_TIMINGS.find((x) => x.value === t)?.label ?? t ?? "";

  if (editing && !isFinalized) {
    return (
      <PrescriptionEditor
        patients={patients}
        medicines={medicines}
        adviceTemplates={adviceTemplates}
        editPrescription={{
          id: prescription.id,
          patientId: prescription.patientId,
          prescriptionDate: prescription.prescriptionDate,
          prescriptionType: prescription.prescriptionType,
          chiefComplaints: prescription.chiefComplaints,
          diagnosis: prescription.diagnosis,
          clinicalNotes: prescription.clinicalNotes,
          investigations: prescription.investigations,
          generalAdvice: prescription.generalAdvice,
          followUpDate: prescription.followUpDate,
          internalNotes: prescription.internalNotes,
          templateData: prescription.templateData,
          items: prescription.items.map((item) => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            strength: item.strength ?? undefined,
            dosage: item.dosage ?? undefined,
            frequency: item.frequency ?? undefined,
            duration: item.duration ?? undefined,
            timing: item.timing ?? undefined,
            route: item.route ?? undefined,
            instructions: item.instructions ?? undefined,
          })),
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/prescriptions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Prescriptions
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Prescription — ${prescription.patient.fullName}`}
        description={formatDate(prescription.prescriptionDate)}
        actions={
          <div className="flex items-center gap-2">
            {isFinalized ? (
              <Badge variant="success" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Finalized
              </Badge>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="success" size="sm" onClick={handleFinalize}>
                  <CheckCircle2 className="h-4 w-4" />
                  Finalize
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
            <Link href={`/print/prescription/${prescription.id}`} target="_blank">
              <Button size="sm">
                <Printer className="h-4 w-4" />
                Print / PDF
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Patient */}
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Patient</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="font-medium text-gray-900">{prescription.patient.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Age / Gender</p>
                  <p className="text-gray-800">{prescription.patient.age ? `${prescription.patient.age} yrs` : "—"} / {prescription.patient.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Mobile</p>
                  <p className="text-gray-800">{prescription.patient.mobile ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical */}
          {(prescription.chiefComplaints || prescription.diagnosis || prescription.clinicalNotes) && (
            <Card>
              <CardContent className="p-5 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clinical Details</p>
                {prescription.chiefComplaints && (
                  <div>
                    <p className="text-xs text-gray-400">Chief Complaints</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{prescription.chiefComplaints}</p>
                  </div>
                )}
                {prescription.diagnosis && (
                  <div>
                    <p className="text-xs text-gray-400">Diagnosis</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{prescription.diagnosis}</p>
                  </div>
                )}
                {prescription.clinicalNotes && (
                  <div>
                    <p className="text-xs text-gray-400">Clinical Notes</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{prescription.clinicalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Eye Prescription Section — read-only view */}
          {isEye && hasEyeData(eyeData) && (
            <EyePrescriptionSection
              value={eyeData}
              onChange={() => {}}
              readOnly
            />
          )}

          {/* Medicines */}
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Rx — Medicines ({prescription.items.length})
              </p>
              {prescription.items.length === 0 ? (
                <p className="text-sm text-gray-400">No medicines added</p>
              ) : (
                <div className="space-y-2">
                  {prescription.items.map((item, i) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <span className="text-sm font-bold text-gray-400 min-w-[1.5rem]">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.medicineName}
                          {item.strength && <span className="font-normal text-gray-600"> {item.strength}</span>}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {[
                            item.dosage,
                            item.frequency,
                            item.duration,
                            timingLabel(item.timing),
                          ].filter(Boolean).join(" · ")}
                        </p>
                        {item.instructions && (
                          <p className="text-xs text-gray-500 italic mt-0.5">{item.instructions}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investigations & Advice */}
          {(prescription.investigations || prescription.generalAdvice) && (
            <Card>
              <CardContent className="p-5 space-y-3">
                {prescription.investigations && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Investigations</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{prescription.investigations}</p>
                  </div>
                )}
                {prescription.generalAdvice && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">General Advice</p>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{prescription.generalAdvice}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-1 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3 text-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</p>
              <div>
                <p className="text-xs text-gray-400">Type</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isEye ? (
                    <Eye className="h-3.5 w-3.5 text-sky-500" />
                  ) : (
                    <Stethoscope className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${isEye ? "text-sky-600" : "text-gray-700"}`}>
                    {typeConfig.label}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-gray-800">{formatDate(prescription.prescriptionDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Follow-up</p>
                <p className="text-gray-800">{prescription.followUpDate ? formatDate(prescription.followUpDate) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <Badge variant={isFinalized ? "success" : "warning"}>
                  {isFinalized ? "Finalized" : "Draft"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {prescription.internalNotes && (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Internal Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{prescription.internalNotes}</p>
                <p className="text-xs text-gray-400 mt-2">Not printed</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
