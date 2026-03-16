"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Doctor, ClinicSettings, AdviceTemplate } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { updateDoctorProfile, updateClinicSettings } from "@/lib/actions/doctor";
import { createAdviceTemplate, deleteAdviceTemplate } from "@/lib/actions/advice";
import { useToast } from "@/components/ui/toaster";
import { Save, Plus, Trash2, Upload, User, Building2, BookOpen } from "lucide-react";
import Image from "next/image";

type DoctorWithClinic = Doctor & { clinicSettings: ClinicSettings | null };

interface Props {
  doctor: DoctorWithClinic | null;
  adviceTemplates: AdviceTemplate[];
}

export function SettingsClient({ doctor, adviceTemplates: initialTemplates }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"doctor" | "clinic" | "advice">("doctor");
  const [templates, setTemplates] = useState(initialTemplates);
  const [newAdviceTitle, setNewAdviceTitle] = useState("");
  const [newAdviceContent, setNewAdviceContent] = useState("");

  const clinic = doctor?.clinicSettings;

  const handleDoctorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("doctor");
    try {
      await updateDoctorProfile(new FormData(e.currentTarget));
      toast("Profile updated", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleClinicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("clinic");
    try {
      await updateClinicSettings(new FormData(e.currentTarget));
      toast("Clinic settings updated", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleAddAdvice = async () => {
    if (!newAdviceTitle.trim() || !newAdviceContent.trim()) {
      toast("Title and content are required", "error");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("title", newAdviceTitle);
      fd.append("content", newAdviceContent);
      const result = await createAdviceTemplate(fd);
      setTemplates((prev) => [...prev, result.template]);
      setNewAdviceTitle("");
      setNewAdviceContent("");
      toast("Advice template added", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleDeleteAdvice = async (id: string) => {
    if (!confirm("Delete this advice template?")) return;
    try {
      await deleteAdviceTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast("Deleted", "success");
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const tabs = [
    { id: "doctor", label: "Doctor Profile", icon: User },
    { id: "clinic", label: "Clinic Settings", icon: Building2 },
    { id: "advice", label: "Advice Templates", icon: BookOpen },
  ] as const;

  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile and clinic information" />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Doctor Profile */}
      {tab === "doctor" && (
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Full Name" required className="col-span-2">
                  <Input name="name" defaultValue={doctor?.name ?? ""} placeholder="Dr. Full Name" required />
                </FormField>
                <FormField label="Qualification">
                  <Input name="qualification" defaultValue={doctor?.qualification ?? ""} placeholder="MBBS, MD" />
                </FormField>
                <FormField label="Specialization">
                  <Input name="specialization" defaultValue={doctor?.specialization ?? ""} placeholder="General Physician" />
                </FormField>
                <FormField label="Registration Number">
                  <Input name="registrationNo" defaultValue={doctor?.registrationNo ?? ""} placeholder="MCI/State Reg No." />
                </FormField>
                <FormField label="Mobile">
                  <Input name="mobile" defaultValue={doctor?.mobile ?? ""} placeholder="+91 98765 43210" />
                </FormField>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={loading === "doctor"}>
                  <Save className="h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clinic Settings */}
      {tab === "clinic" && (
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleClinicSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Clinic Name" className="col-span-2">
                  <Input name="clinicName" defaultValue={clinic?.clinicName ?? ""} placeholder="ABC Multi-speciality Clinic" />
                </FormField>
                <FormField label="Clinic Phone">
                  <Input name="phone" defaultValue={clinic?.phone ?? ""} placeholder="Phone number" />
                </FormField>
              </div>
              <FormField label="Clinic Address">
                <Textarea name="address" defaultValue={clinic?.address ?? ""} placeholder="Full address" rows={2} />
              </FormField>
              <FormField label="Footer / Disclaimer Text">
                <Textarea
                  name="footerText"
                  defaultValue={clinic?.footerText ?? ""}
                  placeholder="e.g. This prescription is valid for 30 days. Please follow doctor's advice."
                  rows={2}
                />
              </FormField>

              {/* File uploads */}
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Clinic Logo">
                  <div className="space-y-2">
                    {clinic?.logoPath && (
                      <div className="relative h-16 w-16 rounded border border-gray-200 overflow-hidden">
                        <Image src={clinic.logoPath} alt="logo" fill className="object-contain" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-xs text-gray-500 hover:border-sky-300 hover:text-sky-600 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Logo
                      <input name="logo" type="file" accept="image/*" className="sr-only" />
                    </label>
                  </div>
                </FormField>
                <FormField label="Signature">
                  <div className="space-y-2">
                    {clinic?.signaturePath && (
                      <div className="relative h-16 w-24 rounded border border-gray-200 overflow-hidden">
                        <Image src={clinic.signaturePath} alt="signature" fill className="object-contain" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-xs text-gray-500 hover:border-sky-300 hover:text-sky-600 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Signature
                      <input name="signature" type="file" accept="image/*" className="sr-only" />
                    </label>
                  </div>
                </FormField>
                <FormField label="Stamp / Seal">
                  <div className="space-y-2">
                    {clinic?.stampPath && (
                      <div className="relative h-16 w-16 rounded border border-gray-200 overflow-hidden">
                        <Image src={clinic.stampPath} alt="stamp" fill className="object-contain" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-xs text-gray-500 hover:border-sky-300 hover:text-sky-600 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Stamp
                      <input name="stamp" type="file" accept="image/*" className="sr-only" />
                    </label>
                  </div>
                </FormField>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={loading === "clinic"}>
                  <Save className="h-4 w-4" />
                  Save Clinic Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Advice Templates */}
      {tab === "advice" && (
        <div className="max-w-2xl space-y-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Add New Advice Template</p>
              <div className="space-y-3">
                <FormField label="Title">
                  <Input
                    placeholder="e.g. General Fever Advice"
                    value={newAdviceTitle}
                    onChange={(e) => setNewAdviceTitle(e.target.value)}
                  />
                </FormField>
                <FormField label="Content">
                  <Textarea
                    placeholder="e.g. Rest, drink plenty of fluids, avoid cold food and drinks"
                    rows={3}
                    value={newAdviceContent}
                    onChange={(e) => setNewAdviceContent(e.target.value)}
                  />
                </FormField>
                <div className="flex justify-end">
                  <Button onClick={handleAddAdvice} size="sm">
                    <Plus className="h-4 w-4" />
                    Add Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {templates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No advice templates yet</p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{t.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAdvice(t.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
