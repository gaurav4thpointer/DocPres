"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { MEDICINE_FORMS, MEDICINE_TIMINGS, FREQUENCIES, DURATIONS, DOSAGES } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  genericName: z.string().optional(),
  form: z.string().min(1),
  strength: z.string().optional(),
  defaultDosage: z.string().optional(),
  defaultFrequency: z.string().optional(),
  defaultDuration: z.string().optional(),
  defaultTiming: z.string().min(1),
  defaultInstructions: z.string().optional(),
  isFavorite: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface MedicineValues {
  name?: string;
  genericName?: string | null;
  form?: string;
  strength?: string | null;
  defaultDosage?: string | null;
  defaultFrequency?: string | null;
  defaultDuration?: string | null;
  defaultTiming?: string;
  defaultInstructions?: string | null;
  isFavorite?: boolean;
}

interface Props {
  defaultValues?: MedicineValues;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const formOptions = MEDICINE_FORMS.map((f) => ({
  value: f,
  label: f.charAt(0) + f.slice(1).toLowerCase(),
}));
const timingOptions = MEDICINE_TIMINGS.map((t) => ({ value: t.value, label: t.label }));

export function MedicineForm({ defaultValues, onSubmit, loading, submitLabel = "Save Medicine" }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      form: "TABLET",
      defaultTiming: "AFTER_FOOD",
      isFavorite: false,
      name: defaultValues?.name ?? "",
      genericName: defaultValues?.genericName ?? "",
      strength: defaultValues?.strength ?? "",
      defaultDosage: defaultValues?.defaultDosage ?? "",
      defaultFrequency: defaultValues?.defaultFrequency ?? "",
      defaultDuration: defaultValues?.defaultDuration ?? "",
      defaultInstructions: defaultValues?.defaultInstructions ?? "",
      ...(defaultValues?.form ? { form: defaultValues.form } : {}),
      ...(defaultValues?.defaultTiming ? { defaultTiming: defaultValues.defaultTiming } : {}),
      ...(defaultValues?.isFavorite !== undefined ? { isFavorite: defaultValues.isFavorite } : {}),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Medicine Name" required error={errors.name?.message} className="col-span-2">
          <Input placeholder="e.g. Metformin" {...register("name")} />
        </FormField>

        <FormField label="Generic Name" error={errors.genericName?.message}>
          <Input placeholder="e.g. Metformin HCl" {...register("genericName")} />
        </FormField>

        <FormField label="Form" error={errors.form?.message}>
          <Select options={formOptions} {...register("form")} />
        </FormField>

        <FormField label="Strength" error={errors.strength?.message}>
          <Input placeholder="e.g. 500mg" {...register("strength")} />
        </FormField>

        <FormField label="Default Dosage" error={errors.defaultDosage?.message}>
          <Input list="dosage-list" placeholder="e.g. 1 tablet" {...register("defaultDosage")} />
          <datalist id="dosage-list">
            {DOSAGES.map((d) => <option key={d} value={d} />)}
          </datalist>
        </FormField>

        <FormField label="Default Frequency" error={errors.defaultFrequency?.message}>
          <Input list="frequency-list" placeholder="e.g. Twice daily (BD)" {...register("defaultFrequency")} />
          <datalist id="frequency-list">
            {FREQUENCIES.map((f) => <option key={f} value={f} />)}
          </datalist>
        </FormField>

        <FormField label="Default Duration" error={errors.defaultDuration?.message}>
          <Input list="duration-list" placeholder="e.g. 7 days" {...register("defaultDuration")} />
          <datalist id="duration-list">
            {DURATIONS.map((d) => <option key={d} value={d} />)}
          </datalist>
        </FormField>

        <FormField label="Default Timing" error={errors.defaultTiming?.message}>
          <Select options={timingOptions} {...register("defaultTiming")} />
        </FormField>
      </div>

      <FormField label="Default Instructions" error={errors.defaultInstructions?.message}>
        <Input placeholder="e.g. Swallow with water" {...register("defaultInstructions")} />
      </FormField>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-sky-600"
          {...register("isFavorite")}
        />
        <span className="text-sm text-gray-700">
          Mark as favorite (appears at top of autocomplete)
        </span>
      </label>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
