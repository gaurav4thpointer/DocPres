"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  importClinic,
  resetClinicPassword,
  resetDoctorPassword,
  impersonateClinic,
  getClinicDoctors,
  createDoctor,
  importDoctorsFromCsv,
} from "@/lib/actions/admin";
import { buildDoctorsImportTemplateCsv } from "@/lib/doctor-import-csv";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Plus,
  LogIn,
  Key,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  UserPlus,
  FileDown,
  Upload,
} from "lucide-react";

interface ClinicWithCount {
  id: string;
  name: string;
  email: string;
  slug: string;
  isActive: boolean;
  _count?: { doctors: number };
}

interface Props {
  initialClinics: ClinicWithCount[];
  total: number;
}

export function AdminClinicsClient({ initialClinics, total }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const doctorImportClinicIdRef = useRef<string | null>(null);
  const doctorImportInputRef = useRef<HTMLInputElement>(null);
  const [clinics, setClinics] = useState(initialClinics);
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<{ type: "clinic" | "doctor"; id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [expandedClinic, setExpandedClinic] = useState<string | null>(null);
  const [addDoctorClinicId, setAddDoctorClinicId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<
    Record<string, { id: string; name: string; email: string; isActive: boolean; defaultPrescriptionType?: string | null }[]>
  >({});

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(`/admin?${params.toString()}`);
  };

  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("import");
    try {
      await importClinic(new FormData(e.currentTarget));
      toast("Clinic imported successfully", "success");
      setShowImport(false);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to import", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleImpersonate = async (clinicId: string) => {
    setLoading(`impersonate-${clinicId}`);
    try {
      const { url } = await impersonateClinic(clinicId);
      window.location.href = url;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to impersonate", "error");
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
      if (resetTarget.type === "clinic") {
        await resetClinicPassword(resetTarget.id, newPassword);
      } else {
        await resetDoctorPassword(resetTarget.id, newPassword);
      }
      toast("Password reset successfully", "success");
      setResetTarget(null);
      setNewPassword("");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reset", "error");
    } finally {
      setLoading(null);
    }
  };

  const toggleExpand = async (clinicId: string) => {
    if (expandedClinic === clinicId) {
      setExpandedClinic(null);
      setAddDoctorClinicId(null);
      return;
    }
    const list = await getClinicDoctors(clinicId);
    setDoctors((d) => ({ ...d, [clinicId]: list }));
    setExpandedClinic(clinicId);
  };

  const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!addDoctorClinicId) return;
    e.preventDefault();
    setLoading("add-doctor");
    try {
      await createDoctor(addDoctorClinicId, new FormData(e.currentTarget));
      toast("Doctor added successfully", "success");
      setAddDoctorClinicId(null);
      const list = await getClinicDoctors(addDoctorClinicId);
      setDoctors((d) => ({ ...d, [addDoctorClinicId]: list }));
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add doctor", "error");
    } finally {
      setLoading(null);
    }
  };

  const downloadDoctorImportTemplate = () => {
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

  const openDoctorImportPicker = (clinicId: string) => {
    doctorImportClinicIdRef.current = clinicId;
    doctorImportInputRef.current?.click();
  };

  const handleDoctorImportCsv: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const clinicId = doctorImportClinicIdRef.current;
    doctorImportClinicIdRef.current = null;
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!clinicId || !file) return;
    setLoading(`import-docs-${clinicId}`);
    try {
      const text = await file.text();
      const result = await importDoctorsFromCsv(clinicId, text);
      const list = await getClinicDoctors(clinicId);
      setDoctors((d) => ({ ...d, [clinicId]: list }));
      router.refresh();
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
    <div className="space-y-6">
      <input
        ref={doctorImportInputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-label="Import doctors CSV for clinic"
        onChange={handleDoctorImportCsv}
      />
      {/* Search & Import */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clinics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <Button onClick={() => setShowImport(!showImport)}>
          <Plus className="h-4 w-4" />
          Import Clinic
        </Button>
      </div>

      {/* Import form */}
      {showImport && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Import new clinic</h3>
            <form onSubmit={handleImport} className="grid grid-cols-2 gap-4 max-w-2xl">
              <FormField label="Clinic name" required>
                <Input name="name" placeholder="ABC Medical Centre" required />
              </FormField>
              <FormField label="Slug (URL-friendly)" required>
                <Input name="slug" placeholder="abc-medical" required />
              </FormField>
              <FormField label="Email" required>
                <Input name="email" type="email" placeholder="clinic@example.com" required />
              </FormField>
              <FormField label="Password" required>
                <Input name="password" type="password" placeholder="••••••••" minLength={6} required />
              </FormField>
              <FormField label="Address" className="col-span-2">
                <Input name="address" placeholder="Full address" />
              </FormField>
              <FormField label="Phone">
                <Input name="phone" placeholder="Phone number" />
              </FormField>
              <div className="col-span-2 flex gap-2">
                <Button type="submit" loading={loading === "import"}>
                  Import
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowImport(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Reset password for {resetTarget.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter the new password (min 6 characters).
              </p>
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

      {/* Clinics list */}
      <div className="space-y-3">
        {clinics.map((clinic) => (
          <Card key={clinic.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900">{clinic.name}</span>
                    {!clinic.isActive && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{clinic.email}</p>
                  <p className="text-xs text-gray-400">
                    {clinic._count
                      ? `${clinic._count.doctors} doctors`
                      : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImpersonate(clinic.id)}
                    loading={loading === `impersonate-${clinic.id}`}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Login as clinic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResetTarget({ type: "clinic", id: clinic.id, name: clinic.name })}
                  >
                    <Key className="h-3.5 w-3.5" />
                    Reset clinic password
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(clinic.id)}
                  >
                    {expandedClinic === clinic.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedClinic === clinic.id && doctors[clinic.id] && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Doctors
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" type="button" onClick={downloadDoctorImportTemplate}>
                        <FileDown className="h-3.5 w-3.5" />
                        Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        loading={loading === `import-docs-${clinic.id}`}
                        onClick={() => openDoctorImportPicker(clinic.id)}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Import CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddDoctorClinicId(addDoctorClinicId === clinic.id ? null : clinic.id)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Add Doctor
                      </Button>
                    </div>
                  </div>

                  {addDoctorClinicId === clinic.id && (
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <h4 className="text-sm font-semibold mb-3">Add new doctor</h4>
                        <form onSubmit={handleAddDoctor} className="grid grid-cols-2 gap-3">
                          <FormField label="Name" required>
                            <Input name="name" placeholder="Dr. Full Name" required />
                          </FormField>
                          <FormField label="Email" required>
                            <Input name="email" type="email" placeholder="doctor@clinic.com" required />
                          </FormField>
                          <FormField label="Password" required>
                            <Input name="password" type="password" placeholder="••••••••" minLength={6} required />
                          </FormField>
                          <FormField label="Prescription Category">
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
                          <div className="col-span-2 flex gap-2">
                            <Button type="submit" size="sm" loading={loading === "add-doctor"}>
                              Add Doctor
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAddDoctorClinicId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-2">
                    {doctors[clinic.id].map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-lg"
                      >
                        <span>
                          {doc.name} <span className="text-gray-500">({doc.email})</span>
                          {doc.defaultPrescriptionType && (
                            <span className="ml-1.5 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {doc.defaultPrescriptionType === "EYE" ? "Eye" : "General"}
                            </span>
                          )}
                          {!doc.isActive && (
                            <span className="text-xs text-red-600 ml-1">Inactive</span>
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setResetTarget({
                              type: "doctor",
                              id: doc.id,
                              name: doc.name,
                            })
                          }
                        >
                          <Key className="h-3 w-3" />
                          Reset password
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {clinics.length === 0 && (
        <p className="text-center text-gray-500 py-12">No clinics found. Import one to get started.</p>
      )}
    </div>
  );
}
