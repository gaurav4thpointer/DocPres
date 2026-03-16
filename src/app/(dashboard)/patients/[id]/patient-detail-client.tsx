"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Patient, Prescription, PrescriptionItem } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { PatientForm } from "@/components/patients/patient-form";
import { updatePatient, deletePatient } from "@/lib/actions/patients";
import { useToast } from "@/components/ui/toaster";
import { formatDate, getInitials } from "@/lib/utils";
import { ArrowLeft, Edit2, Trash2, PlusCircle, FileText } from "lucide-react";
import Link from "next/link";

type PatientWithPrescriptions = Patient & {
  prescriptions: (Prescription & { items: PrescriptionItem[] })[];
};

export function PatientDetailClient({ patient }: { patient: PatientWithPrescriptions }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, String(v));
      });
      await updatePatient(patient.id, fd);
      toast("Patient updated successfully", "success");
      setShowEdit(false);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this patient and all their prescriptions? This cannot be undone.")) return;
    try {
      await deletePatient(patient.id);
      toast("Patient deleted", "success");
      router.push("/patients");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  const infoItems = [
    { label: "Gender", value: patient.gender },
    { label: "Age", value: patient.age ? `${patient.age} years` : "—" },
    { label: "Mobile", value: patient.mobile ?? "—" },
    { label: "Weight", value: patient.weight ? `${patient.weight} kg` : "—" },
    { label: "Address", value: patient.address ?? "—" },
    { label: "Allergies", value: patient.allergies ?? "—" },
    { label: "Chronic Conditions", value: patient.chronicConditions ?? "—" },
    { label: "Notes", value: patient.notes ?? "—" },
  ];

  return (
    <div>
      <div className="mb-4">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
      </div>

      <PageHeader
        title={patient.fullName}
        description={`Patient since ${formatDate(patient.createdAt)}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/prescriptions/new?patientId=${patient.id}`}>
              <Button size="sm">
                <PlusCircle className="h-4 w-4" />
                New Prescription
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="col-span-1">
          <CardContent className="p-6">
            <div className="text-center mb-5">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xl font-bold mb-2">
                {getInitials(patient.fullName)}
              </div>
              <h2 className="text-base font-semibold text-gray-900">{patient.fullName}</h2>
              <p className="text-sm text-gray-500">
                {patient.age ? `${patient.age} yrs` : ""} · {patient.gender}
              </p>
            </div>
            <div className="space-y-3">
              {infoItems.map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card className="col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  Prescriptions ({patient.prescriptions.length})
                </p>
              </div>
            </div>
            {patient.prescriptions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400">No prescriptions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {patient.prescriptions.map((rx) => (
                  <Link
                    key={rx.id}
                    href={`/prescriptions/${rx.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(rx.prescriptionDate)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {rx.items.length} medicine{rx.items.length !== 1 ? "s" : ""}
                        {rx.diagnosis ? ` · ${rx.diagnosis}` : ""}
                      </p>
                    </div>
                    <Badge variant={rx.status === "FINALIZED" ? "success" : "warning"}>
                      {rx.status === "FINALIZED" ? "Finalized" : "Draft"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Patient" className="max-w-2xl">
        <PatientForm
          defaultValues={{
            fullName: patient.fullName,
            age: patient.age,
            gender: patient.gender,
            mobile: patient.mobile,
            address: patient.address,
            allergies: patient.allergies,
            chronicConditions: patient.chronicConditions,
            notes: patient.notes,
            weight: patient.weight,
          }}
          onSubmit={handleUpdate}
          loading={loading}
          submitLabel="Update Patient"
        />
      </Modal>
    </div>
  );
}
