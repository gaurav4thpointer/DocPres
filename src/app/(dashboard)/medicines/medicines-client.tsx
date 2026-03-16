"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Medicine } from "@prisma/client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { MedicineForm } from "./medicine-form";
import { createMedicine, updateMedicine, deleteMedicine, toggleFavorite } from "@/lib/actions/medicines";
import { useToast } from "@/components/ui/toaster";
import { Plus, Search, Pill, Star, Edit2, Trash2 } from "lucide-react";

interface Props {
  medicines: Medicine[];
  initialSearch: string;
}

export function MedicinesClient({ medicines, initialSearch }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editMedicine, setEditMedicine] = useState<Medicine | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const handleSearch = (val: string) => {
    setSearch(val);
    startTransition(() => router.push(`/medicines?search=${val}`));
  };

  const toFormData = (data: Record<string, unknown>) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    return fd;
  };

  const handleAdd = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      await createMedicine(toFormData(data));
      toast("Medicine added", "success");
      setShowAdd(false);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editMedicine) return;
    setLoading(true);
    try {
      await updateMedicine(editMedicine.id, toFormData(data));
      toast("Medicine updated", "success");
      setEditMedicine(null);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this medicine?")) return;
    try {
      await deleteMedicine(id);
      toast("Medicine deleted", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  const handleToggleFav = async (id: string, current: boolean) => {
    try {
      await toggleFavorite(id, !current);
      router.refresh();
    } catch {
      toast("Failed to update favorite", "error");
    }
  };

  const favorites = medicines.filter((m) => m.isFavorite);
  const others = medicines.filter((m) => !m.isFavorite);

  const MedicineRow = ({ m }: { m: Medicine }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleFav(m.id, m.isFavorite)}
            className={m.isFavorite ? "text-amber-400" : "text-gray-200 hover:text-amber-300"}
          >
            <Star className="h-4 w-4 fill-current" />
          </button>
          <div>
            <p className="font-medium text-gray-900">{m.name}</p>
            {m.genericName && <p className="text-xs text-gray-500">{m.genericName}</p>}
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <Badge variant="secondary" className="text-xs">{m.form}</Badge>
      </td>
      <td className="px-5 py-3 text-sm text-gray-600">{m.strength ?? "—"}</td>
      <td className="px-5 py-3 text-sm text-gray-600">{m.defaultDosage ?? "—"}</td>
      <td className="px-5 py-3 text-sm text-gray-600">{m.defaultFrequency ?? "—"}</td>
      <td className="px-5 py-3 text-sm text-gray-600">{m.defaultDuration ?? "—"}</td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditMedicine(m)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <PageHeader
        title="Medicine Master"
        description={`${medicines.length} medicine${medicines.length !== 1 ? "s" : ""} in your list`}
        actions={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Add Medicine
          </Button>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search medicines..."
          className="pl-9"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {medicines.length === 0 ? (
            <EmptyState
              icon={<Pill className="h-12 w-12" />}
              title="No medicines yet"
              description="Add medicines to your master list for quick prescription autocomplete"
              action={<Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" />Add Medicine</Button>}
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Medicine</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Form</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Strength</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Dosage</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Frequency</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Duration</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {favorites.length > 0 && (
                  <>
                    <tr>
                      <td colSpan={7} className="px-5 py-2 bg-amber-50">
                        <span className="text-xs font-semibold text-amber-700">⭐ Favorites</span>
                      </td>
                    </tr>
                    {favorites.map((m) => <MedicineRow key={m.id} m={m} />)}
                    {others.length > 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-2 bg-gray-50">
                          <span className="text-xs font-semibold text-gray-500">All Medicines</span>
                        </td>
                      </tr>
                    )}
                  </>
                )}
                {others.map((m) => <MedicineRow key={m.id} m={m} />)}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Medicine">
        <MedicineForm onSubmit={handleAdd} loading={loading} />
      </Modal>

      <Modal open={!!editMedicine} onClose={() => setEditMedicine(null)} title="Edit Medicine">
        {editMedicine && (
          <MedicineForm
            defaultValues={editMedicine}
            onSubmit={handleEdit}
            loading={loading}
            submitLabel="Update Medicine"
          />
        )}
      </Modal>
    </div>
  );
}
