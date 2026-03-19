"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Patient, Medicine, AdviceTemplate, PrescriptionType } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { MedicineRow, MedicineRowData } from "./medicine-row";
import { EyePrescriptionSection } from "./eye-prescription-section";
import { PatientForm } from "@/components/patients/patient-form";
import { createPrescription, updatePrescription } from "@/lib/actions/prescriptions";
import { createPatient } from "@/lib/actions/patients";
import { useToast } from "@/components/ui/toaster";
import type { DoctorForPrescription } from "@/lib/actions/doctor";
import { parseEyeTemplateData } from "@/lib/prescription-templates/eye";
import type { EyeTemplateData } from "@/lib/prescription-templates/eye";
import { format } from "date-fns";
import { Plus, UserPlus, CheckCircle2, Save, Printer, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";

interface Props {
  patients: Patient[];
  medicines: Medicine[];
  adviceTemplates: AdviceTemplate[];
  doctors?: DoctorForPrescription[];
  defaultPatientId?: string;
  /** Server-provided date for new prescriptions (avoids hydration mismatch from timezone differences) */
  defaultPrescriptionDate?: string;
  editPrescription?: {
    id: string;
    patientId: string;
    prescriptionDate: Date;
    prescriptionType: PrescriptionType;
    chiefComplaints: string | null;
    diagnosis: string | null;
    clinicalNotes: string | null;
    investigations: string | null;
    generalAdvice: string | null;
    followUpDate: Date | null;
    internalNotes: string | null;
    templateData: unknown;
    items: MedicineRowData[];
  };
}

const schema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().optional(),
  prescriptionDate: z.string().min(1),
  prescriptionType: z.nativeEnum(PrescriptionType),
  chiefComplaints: z.string().optional(),
  diagnosis: z.string().optional(),
  clinicalNotes: z.string().optional(),
  investigations: z.string().optional(),
  generalAdvice: z.string().optional(),
  followUpDate: z.string().optional(),
  internalNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const emptyRow = (): MedicineRowData => ({
  medicineName: "",
  strength: "",
  dosage: "",
  frequency: "",
  duration: "",
  timing: undefined,
  instructions: "",
});

export function PrescriptionEditor({
  patients,
  medicines,
  adviceTemplates,
  doctors = [],
  defaultPatientId,
  defaultPrescriptionDate,
  editPrescription,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientList, setPatientList] = useState(patients);
  const [rows, setRows] = useState<MedicineRowData[]>(
    editPrescription?.items?.length ? editPrescription.items : [emptyRow()]
  );
  const [eyeData, setEyeData] = useState<EyeTemplateData>(
    editPrescription?.prescriptionType === "EYE"
      ? parseEyeTemplateData(editPrescription.templateData)
      : {}
  );

  const defaultDoctor = doctors[0];
  const defaultType =
    editPrescription?.prescriptionType ??
    (defaultDoctor?.defaultPrescriptionType ?? PrescriptionType.GENERAL);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: defaultPatientId ?? editPrescription?.patientId ?? "",
      doctorId: defaultDoctor?.id ?? "",
      prescriptionDate: editPrescription
        ? format(new Date(editPrescription.prescriptionDate), "yyyy-MM-dd")
        : defaultPrescriptionDate ?? format(new Date(), "yyyy-MM-dd"),
      prescriptionType: defaultType,
      chiefComplaints: editPrescription?.chiefComplaints ?? "",
      diagnosis: editPrescription?.diagnosis ?? "",
      clinicalNotes: editPrescription?.clinicalNotes ?? "",
      investigations: editPrescription?.investigations ?? "",
      generalAdvice: editPrescription?.generalAdvice ?? "",
      followUpDate: editPrescription?.followUpDate
        ? format(new Date(editPrescription.followUpDate), "yyyy-MM-dd")
        : "",
      internalNotes: editPrescription?.internalNotes ?? "",
    },
  });

  const doctorId = watch("doctorId");
  const prescriptionType = watch("prescriptionType");
  const isEye = prescriptionType === "EYE";

  const selectedDoctor = doctors.find((d) => d.id === doctorId) ?? defaultDoctor;
  const allowedPrescriptionType =
    selectedDoctor?.defaultPrescriptionType ?? editPrescription?.prescriptionType ?? PrescriptionType.GENERAL;

  useEffect(() => {
    if (!editPrescription && selectedDoctor && prescriptionType !== allowedPrescriptionType) {
      setValue("prescriptionType", allowedPrescriptionType);
    }
  }, [selectedDoctor?.id, allowedPrescriptionType, editPrescription, prescriptionType, setValue]);

  const addRow = () => setRows((r) => [...r, emptyRow()]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, data: MedicineRowData) => {
    setRows((r) => r.map((row, idx) => (idx === i ? data : row)));
  };

  const buildPayload = (data: FormData, status: "DRAFT" | "FINALIZED") => ({
    ...data,
    status,
    templateData: isEye ? eyeData : null,
    items: rows.filter((r) => r.medicineName.trim()),
  });

  const handleSaveDraft = handleSubmit(async (data) => {
    setLoading(true);
    try {
      if (editPrescription) {
        await updatePrescription(editPrescription.id, buildPayload(data, "DRAFT") as Parameters<typeof updatePrescription>[1]);
        toast("Draft saved", "success");
        router.refresh();
      } else {
        const result = await createPrescription(buildPayload(data, "DRAFT") as Parameters<typeof createPrescription>[0]);
        toast("Draft saved", "success");
        router.push(`/prescriptions/${result.prescription.id}`);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setLoading(false);
    }
  });

  const handleFinalize = handleSubmit(async (data) => {
    if (!confirm("Finalize this prescription? It will be locked for editing.")) return;
    setLoading(true);
    try {
      if (editPrescription) {
        await updatePrescription(editPrescription.id, buildPayload(data, "FINALIZED") as Parameters<typeof updatePrescription>[1]);
        toast("Prescription finalized", "success");
        router.push(`/prescriptions/${editPrescription.id}`);
      } else {
        const result = await createPrescription(buildPayload(data, "FINALIZED") as Parameters<typeof createPrescription>[0]);
        toast("Prescription finalized", "success");
        router.push(`/prescriptions/${result.prescription.id}`);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to finalize", "error");
    } finally {
      setLoading(false);
    }
  });

  const handleAddPatient = async (data: Record<string, unknown>) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, String(v));
      });
      const result = await createPatient(fd);
      setPatientList((prev) => [result.patient, ...prev]);
      setValue("patientId", result.patient.id);
      setShowAddPatient(false);
      toast("Patient added", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add patient", "error");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Link href="/prescriptions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <PageHeader
        title={editPrescription ? "Edit Prescription" : "New Prescription"}
        description="Fill in the details and add medicines"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft} loading={loading}>
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button size="sm" variant="success" onClick={handleFinalize} loading={loading}>
              <CheckCircle2 className="h-4 w-4" />
              Finalize
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Main form */}
        <div className="col-span-2 space-y-5">
          {/* Patient & Date */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Patient Information</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Patient" required error={errors.patientId?.message} className="col-span-2">
                  <div className="flex gap-2">
                    <select
                      className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      {...register("patientId")}
                    >
                      <option value="">Select patient...</option>
                      {patientList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName}{p.age ? ` (${p.age}y)` : ""}{p.mobile ? ` - ${p.mobile}` : ""}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Add new patient"
                      onClick={() => setShowAddPatient(true)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </FormField>
                <FormField label="Prescription Date" required error={errors.prescriptionDate?.message}>
                  <Input type="date" {...register("prescriptionDate")} />
                </FormField>
                <FormField label="Follow-up Date">
                  <Input type="date" {...register("followUpDate")} />
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Doctor selection - dropdown when multiple, hidden when single */}
          {doctors.length > 1 ? (
            <Card>
              <CardContent className="p-5">
                <FormField label="Prescribing Doctor" required>
                  <select
                    className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    {...register("doctorId")}
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </CardContent>
            </Card>
          ) : (
            doctors.length === 1 && <input type="hidden" {...register("doctorId")} />
          )}

          {/* Clinical Details */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Clinical Details</p>
              <FormField label="Chief Complaints">
                <Textarea
                  placeholder="e.g. Fever, headache for 3 days"
                  rows={2}
                  {...register("chiefComplaints")}
                />
              </FormField>
              <FormField label="Diagnosis">
                <Textarea
                  placeholder="e.g. Viral fever, URTI"
                  rows={2}
                  {...register("diagnosis")}
                />
              </FormField>
              <FormField label="Clinical Notes">
                <Textarea
                  placeholder="Additional clinical observations"
                  rows={2}
                  {...register("clinicalNotes")}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Eye-specific section */}
          {isEye && (
            <EyePrescriptionSection
              value={eyeData}
              onChange={setEyeData}
            />
          )}

          {/* Medicines */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">
                  Rx — Medicines ({rows.filter(r => r.medicineName.trim()).length})
                </p>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <Plus className="h-4 w-4" />
                  Add Medicine
                </Button>
              </div>

              <div className="grid grid-cols-12 gap-2 px-3 pb-1 text-xs font-medium text-gray-400">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Medicine</div>
                <div className="col-span-1">Strength</div>
                <div className="col-span-1">Dosage</div>
                <div className="col-span-2">Frequency</div>
                <div className="col-span-1">Duration</div>
                <div className="col-span-2">Timing</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-2">
                {rows.map((row, i) => (
                  <MedicineRow
                    key={i}
                    index={i}
                    data={row}
                    medicines={medicines}
                    onChange={updateRow}
                    onRemove={removeRow}
                  />
                ))}
              </div>

              {rows.length === 0 && (
                <button
                  type="button"
                  onClick={addRow}
                  className="w-full py-4 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg hover:border-sky-300 hover:text-sky-500 transition-colors"
                >
                  + Add first medicine
                </button>
              )}
            </CardContent>
          </Card>

          {/* Investigations & Advice */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Investigations & Advice</p>
              <FormField label="Investigations / Tests Advised">
                <Textarea
                  placeholder="e.g. CBC, Blood Sugar, X-Ray Chest"
                  rows={2}
                  {...register("investigations")}
                />
              </FormField>
              <FormField label="General Advice">
                <div className="space-y-2">
                  <Textarea
                    placeholder="e.g. Rest, drink plenty of fluids, avoid cold food"
                    rows={3}
                    {...register("generalAdvice")}
                  />
                  {adviceTemplates.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {adviceTemplates.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            const current = watch("generalAdvice") ?? "";
                            setValue("generalAdvice", current ? `${current}\n${t.content}` : t.content);
                          }}
                          className="rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-700 hover:bg-sky-100 transition-colors"
                        >
                          + {t.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 space-y-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Actions</p>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={handleSaveDraft} loading={loading}>
                  <Save className="h-4 w-4" />
                  Save as Draft
                </Button>
                <Button className="w-full" variant="success" onClick={handleFinalize} loading={loading}>
                  <CheckCircle2 className="h-4 w-4" />
                  Finalize Prescription
                </Button>
                {editPrescription && (
                  <Link href={`/print/prescription/${editPrescription.id}`} target="_blank" className="block">
                    <Button className="w-full" variant="secondary">
                      <Printer className="h-4 w-4" />
                      Print Preview
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Internal Notes</p>
              <Textarea
                placeholder="Private notes (not printed)"
                rows={4}
                {...register("internalNotes")}
              />
              <p className="text-xs text-gray-400 mt-1">Not visible on prescription print</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Summary</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-sky-600">
                    {isEye ? "Eye" : "General"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Medicines</span>
                  <span className="font-medium">{rows.filter(r => r.medicineName.trim()).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-amber-600 font-medium">Draft</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal open={showAddPatient} onClose={() => setShowAddPatient(false)} title="Quick Add Patient" className="max-w-2xl">
        <PatientForm onSubmit={handleAddPatient} submitLabel="Add & Select Patient" />
      </Modal>
    </div>
  );
}
