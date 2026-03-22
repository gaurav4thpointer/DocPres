"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDoctor,
  getClinicDoctors,
  importDoctorsFromCsv,
  resetDoctorPassword,
} from "@/lib/actions/admin";
import { buildDoctorsImportTemplateCsv } from "@/lib/doctor-import-csv";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { FileDown, Key, Upload, UserPlus } from "lucide-react";
import { PrescriptionType } from "@prisma/client";

type DoctorRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  defaultPrescriptionType: PrescriptionType | null;
};

interface Props {
  initialDoctors: DoctorRow[];
  clinicId: string;
}

export function DoctorsClient({ initialDoctors, clinicId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const refreshDoctors = async () => {
    const list = await getClinicDoctors(clinicId);
    setDoctors(list);
    router.refresh();
  };

  const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("add-doctor");
    try {
      await createDoctor(clinicId, new FormData(e.currentTarget));
      toast("Doctor added successfully", "success");
      setShowAdd(false);
      e.currentTarget.reset();
      await refreshDoctors();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add doctor", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword || newPassword.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    setLoading("reset");
    try {
      await resetDoctorPassword(resetTarget.id, newPassword);
      toast("Password reset successfully", "success");
      setResetTarget(null);
      setNewPassword("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reset", "error");
    } finally {
      setLoading(null);
    }
  };

  const downloadImportTemplate = () => {
    const blob = new Blob([buildDoctorsImportTemplateCsv()], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "doctors-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLoading("import-csv");
    try {
      const text = await file.text();
      const result = await importDoctorsFromCsv(clinicId, text);
      await refreshDoctors();
      const detail =
        result.errors.length > 0
          ? ` ${result.errors
              .slice(0, 5)
              .map((err) => `Row ${err.row}: ${err.message}`)
              .join(" · ")}${result.errors.length > 5 ? " …" : ""}`
          : "";
      if (result.created === 0 && result.errors.length > 0) {
        toast(`Import failed.${detail}`, "error");
      } else if (result.errors.length > 0) {
        toast(`Imported ${result.created} doctor(s). Some rows failed.${detail}`, "info");
      } else {
        toast(`Imported ${result.created} doctor(s).`, "success");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Import failed", "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Doctors"
        description="Add or import doctors, download a CSV template, and reset login passwords."
        actions={
          <>
            <Button type="button" variant="outline" size="sm" onClick={downloadImportTemplate}>
              <FileDown className="h-4 w-4" />
              Download template
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label="Import doctors CSV"
              onChange={handleImportCsv}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={loading === "import-csv"}
              onClick={() => importInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={() => setShowAdd((s) => !s)}>
              <UserPlus className="h-4 w-4" />
              Add doctor
            </Button>
          </>
        }
      />

      {showAdd && (
        <Card className="mb-6 bg-gray-50">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3">New doctor</h4>
            <form onSubmit={handleAddDoctor} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Name" required>
                <Input name="name" placeholder="Dr. Full Name" required />
              </FormField>
              <FormField label="Email" required>
                <Input name="email" type="email" placeholder="doctor@clinic.com" required />
              </FormField>
              <FormField label="Password" required>
                <Input name="password" type="password" placeholder="••••••••" minLength={6} required />
              </FormField>
              <FormField label="Prescription category">
                <select
                  name="defaultPrescriptionType"
                  className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm"
                >
                  <option value="GENERAL">General</option>
                  <option value="EYE">Eye</option>
                </select>
              </FormField>
              <FormField label="Qualification">
                <Input name="qualification" placeholder="MBBS, MD" />
              </FormField>
              <FormField label="Specialization">
                <Input name="specialization" placeholder="General Physician" />
              </FormField>
              <FormField label="Registration No.">
                <Input name="registrationNo" placeholder="MCI/State Reg No." />
              </FormField>
              <FormField label="Mobile">
                <Input name="mobile" placeholder="+91 98765 43210" />
              </FormField>
              <div className="col-span-full flex gap-2">
                <Button type="submit" size="sm" loading={loading === "add-doctor"}>
                  Add doctor
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm py-3 px-4 bg-white border border-gray-100 rounded-lg"
          >
            <span>
              <span className="font-medium text-gray-900">{doc.name}</span>{" "}
              <span className="text-gray-500">({doc.email})</span>
              {doc.defaultPrescriptionType && (
                <span className="ml-1.5 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {doc.defaultPrescriptionType === "EYE" ? "Eye" : "General"}
                </span>
              )}
              {!doc.isActive && <span className="text-xs text-red-600 ml-1">Inactive</span>}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 self-start sm:self-auto"
              onClick={() => setResetTarget({ id: doc.id, name: doc.name })}
            >
              <Key className="h-3.5 w-3.5" />
              Reset password
            </Button>
          </div>
        ))}
      </div>

      {doctors.length === 0 && !showAdd && (
        <p className="text-center text-gray-500 py-12">No doctors yet. Add your first doctor above.</p>
      )}

      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Reset password for {resetTarget.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Enter the new password (min 6 characters).</p>
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button onClick={handleResetPassword} loading={loading === "reset"} disabled={newPassword.length < 6}>
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResetTarget(null);
                    setNewPassword("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
