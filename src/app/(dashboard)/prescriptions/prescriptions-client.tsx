"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Prescription, PrescriptionItem, PrescriptionStatus } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { duplicatePrescription, deletePrescription } from "@/lib/actions/prescriptions";
import { useToast } from "@/components/ui/toaster";
import { formatDate } from "@/lib/utils";
import {
  Search, FileText, PlusCircle, Copy, Trash2,
  Eye, Printer, ChevronLeft, ChevronRight
} from "lucide-react";
import Link from "next/link";

type RxWithPatient = Prescription & {
  patient: { id: string; fullName: string; age: number | null; gender: string; mobile: string | null };
  items: PrescriptionItem[];
};

interface Props {
  prescriptions: RxWithPatient[];
  total: number;
  initialSearch: string;
  initialStatus?: PrescriptionStatus;
  page: number;
}

export function PrescriptionsClient({ prescriptions, total, initialSearch, initialStatus, page }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus ?? "");
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / 20);

  const applyFilter = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newStatus) params.set("status", newStatus);
    startTransition(() => router.push(`/prescriptions?${params.toString()}`));
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    applyFilter(val, status);
  };

  const handleStatus = (val: string) => {
    setStatus(val);
    applyFilter(search, val);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const result = await duplicatePrescription(id);
      toast("Prescription duplicated as draft", "success");
      router.push(`/prescriptions/${result.prescription.id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to duplicate", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this draft prescription?")) return;
    try {
      await deletePrescription(id);
      toast("Prescription deleted", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Prescription History"
        description={`${total} prescription${total !== 1 ? "s" : ""}`}
        actions={
          <Link href="/prescriptions/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Prescription
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by patient, diagnosis..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {[
            { value: "", label: "All" },
            { value: "DRAFT", label: "Drafts" },
            { value: "FINALIZED", label: "Finalized" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatus(opt.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                status === opt.value
                  ? "bg-sky-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {prescriptions.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No prescriptions found"
              description={search ? "Try a different search" : "Create your first prescription"}
              action={
                <Link href="/prescriptions/new">
                  <Button><PlusCircle className="h-4 w-4" />New Prescription</Button>
                </Link>
              }
            />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Patient</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Diagnosis</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Medicines</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{rx.patient.fullName}</p>
                        <p className="text-xs text-gray-500">{rx.patient.mobile ?? "—"}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{formatDate(rx.prescriptionDate)}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">{rx.diagnosis ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-600">{rx.items.length} item{rx.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-5 py-3">
                        <Badge variant={rx.status === "FINALIZED" ? "success" : "warning"}>
                          {rx.status === "FINALIZED" ? "Finalized" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/prescriptions/${rx.id}`}>
                            <Button variant="ghost" size="icon" title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Link href={`/print/prescription/${rx.id}`} target="_blank">
                            <Button variant="ghost" size="icon" title="Print">
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" title="Duplicate" onClick={() => handleDuplicate(rx.id)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          {rx.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => handleDelete(rx.id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" size="icon"
                      disabled={page <= 1}
                      onClick={() => router.push(`/prescriptions?page=${page - 1}&search=${search}&status=${status}`)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                    <Button
                      variant="outline" size="icon"
                      disabled={page >= totalPages}
                      onClick={() => router.push(`/prescriptions?page=${page + 1}&search=${search}&status=${status}`)}
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
    </div>
  );
}
