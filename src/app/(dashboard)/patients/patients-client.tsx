"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Patient, Gender } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PatientForm } from "@/components/patients/patient-form";
import { createPatient } from "@/lib/actions/patients";
import { useToast } from "@/components/ui/toaster";
import { formatDate, getInitials } from "@/lib/utils";
import { UserPlus, Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  patients: Patient[];
  total: number;
  initialSearch: string;
  page: number;
  openAdd?: boolean;
}

export function PatientsClient({ patients, total, initialSearch, page, openAdd = false }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(openAdd);
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / 20);

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(() => {
      router.push(`/patients?search=${value}`);
    });
  };

  const handleAddPatient = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, String(v));
      });
      await createPatient(fd);
      toast("Patient added successfully", "success");
      setShowAdd(false);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add patient", "error");
    } finally {
      setLoading(false);
    }
  };

  const genderColors: Record<Gender, string> = {
    MALE: "bg-blue-100 text-blue-700",
    FEMALE: "bg-pink-100 text-pink-700",
    OTHER: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <PageHeader
        title="Patients"
        description={`${total} patient${total !== 1 ? "s" : ""} registered`}
        actions={
          <Button onClick={() => setShowAdd(true)}>
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or mobile..."
          className="pl-9"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {patients.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No patients found"
              description={search ? "Try a different search term" : "Add your first patient to get started"}
              action={
                !search && (
                  <Button onClick={() => setShowAdd(true)}>
                    <UserPlus className="h-4 w-4" />
                    Add Patient
                  </Button>
                )
              }
            />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Patient</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Gender</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Age</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Mobile</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Added</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                            {getInitials(patient.fullName)}
                          </div>
                          <span className="font-medium text-gray-900">{patient.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${genderColors[patient.gender]}`}>
                          {patient.gender}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {patient.age ? `${patient.age} yrs` : "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{patient.mobile ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(patient.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/patients/${patient.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                          <Link href={`/prescriptions/new?patientId=${patient.id}`}>
                            <Button size="sm">Prescribe</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page <= 1}
                      onClick={() => router.push(`/patients?page=${page - 1}&search=${search}`)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page >= totalPages}
                      onClick={() => router.push(`/patients?page=${page + 1}&search=${search}`)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Patient Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add New Patient"
        className="max-w-2xl"
      >
        <PatientForm onSubmit={handleAddPatient} loading={loading} />
      </Modal>
    </div>
  );
}
