"use client";

import { useState, useRef, useEffect } from "react";
import { Medicine, MedicineTiming } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MEDICINE_TIMINGS, FREQUENCIES, DURATIONS, DOSAGES } from "@/lib/utils";
import { Trash2, Star } from "lucide-react";

export interface MedicineRowData {
  medicineId?: string | null;
  medicineName: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  timing?: MedicineTiming;
  route?: string;
  instructions?: string;
}

interface Props {
  index: number;
  data: MedicineRowData;
  medicines: Medicine[];
  onChange: (index: number, data: MedicineRowData) => void;
  onRemove: (index: number) => void;
}

const timingOptions = MEDICINE_TIMINGS.map((t) => ({ value: t.value, label: t.label }));

export function MedicineRow({ index, data, medicines, onChange, onRemove }: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState(data.medicineName ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = query.length >= 1
    ? medicines.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        (m.genericName?.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectMedicine = (m: Medicine) => {
    setQuery(m.name);
    setShowSuggestions(false);
    onChange(index, {
      ...data,
      medicineId: m.id,
      medicineName: m.name,
      strength: m.strength ?? data.strength,
      dosage: m.defaultDosage ?? data.dosage,
      frequency: m.defaultFrequency ?? data.frequency,
      duration: m.defaultDuration ?? data.duration,
      timing: m.defaultTiming ?? data.timing,
      instructions: m.defaultInstructions ?? data.instructions,
    });
  };

  const update = (field: keyof MedicineRowData, value: string) => {
    onChange(index, { ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border border-gray-100 bg-gray-50 relative group">
      <div className="col-span-1 flex items-center justify-center pt-2 text-sm font-medium text-gray-400">
        {index + 1}.
      </div>

      {/* Medicine name with autocomplete */}
      <div className="col-span-3 relative" ref={containerRef}>
        <Input
          placeholder="Medicine name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(index, { ...data, medicineName: e.target.value, medicineId: null });
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="text-xs"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((m) => (
              <button
                key={m.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-sky-50 transition-colors"
                onMouseDown={() => selectMedicine(m)}
              >
                {m.isFavorite && <Star className="h-3 w-3 text-amber-400 fill-current flex-shrink-0" />}
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                  {m.genericName && <p className="text-xs text-gray-500">{m.genericName} · {m.form}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-1">
        <Input
          placeholder="Strength"
          value={data.strength ?? ""}
          onChange={(e) => update("strength", e.target.value)}
          className="text-xs"
        />
      </div>

      <div className="col-span-1">
        <Input
          list={`dosage-${index}`}
          placeholder="Dosage"
          value={data.dosage ?? ""}
          onChange={(e) => update("dosage", e.target.value)}
          className="text-xs"
        />
        <datalist id={`dosage-${index}`}>
          {DOSAGES.map((d) => <option key={d} value={d} />)}
        </datalist>
      </div>

      <div className="col-span-2">
        <Input
          list={`freq-${index}`}
          placeholder="Frequency"
          value={data.frequency ?? ""}
          onChange={(e) => update("frequency", e.target.value)}
          className="text-xs"
        />
        <datalist id={`freq-${index}`}>
          {FREQUENCIES.map((f) => <option key={f} value={f} />)}
        </datalist>
      </div>

      <div className="col-span-1">
        <Input
          list={`dur-${index}`}
          placeholder="Duration"
          value={data.duration ?? ""}
          onChange={(e) => update("duration", e.target.value)}
          className="text-xs"
        />
        <datalist id={`dur-${index}`}>
          {DURATIONS.map((d) => <option key={d} value={d} />)}
        </datalist>
      </div>

      <div className="col-span-2">
        <select
          value={data.timing ?? ""}
          onChange={(e) => update("timing", e.target.value)}
          className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Timing</option>
          {timingOptions.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="col-span-1 flex items-start pt-1 justify-end">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
