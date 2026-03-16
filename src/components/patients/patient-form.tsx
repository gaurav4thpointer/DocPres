"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { GENDERS } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  age: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  mobile: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  notes: z.string().optional(),
  weight: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PatientFormProps {
  defaultValues?: Partial<Record<string, string | number | null | undefined>>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

export function PatientForm({ defaultValues, onSubmit, loading, submitLabel = "Save Patient" }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: "MALE",
      fullName: defaultValues?.fullName ? String(defaultValues.fullName) : "",
      age: defaultValues?.age ? String(defaultValues.age) : "",
      dateOfBirth: defaultValues?.dateOfBirth ? String(defaultValues.dateOfBirth) : "",
      mobile: defaultValues?.mobile ? String(defaultValues.mobile) : "",
      address: defaultValues?.address ? String(defaultValues.address) : "",
      allergies: defaultValues?.allergies ? String(defaultValues.allergies) : "",
      chronicConditions: defaultValues?.chronicConditions ? String(defaultValues.chronicConditions) : "",
      notes: defaultValues?.notes ? String(defaultValues.notes) : "",
      weight: defaultValues?.weight ? String(defaultValues.weight) : "",
      ...Object.fromEntries(
        Object.entries(defaultValues ?? {})
          .filter(([k, v]) => k === "gender" && v != null)
          .map(([k, v]) => [k, String(v)])
      ),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name" required error={errors.fullName?.message} className="col-span-2">
          <Input placeholder="Patient full name" {...register("fullName")} />
        </FormField>

        <FormField label="Gender" required error={errors.gender?.message}>
          <Select
            options={GENDERS}
            placeholder="Select gender"
            {...register("gender")}
          />
        </FormField>

        <FormField label="Age (years)" error={errors.age?.message}>
          <Input type="number" placeholder="e.g. 35" {...register("age")} />
        </FormField>

        <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
          <Input type="date" {...register("dateOfBirth")} />
        </FormField>

        <FormField label="Mobile Number" error={errors.mobile?.message}>
          <Input placeholder="+91 98765 43210" {...register("mobile")} />
        </FormField>

        <FormField label="Weight (kg)" error={errors.weight?.message}>
          <Input type="number" step="0.1" placeholder="e.g. 65.5" {...register("weight")} />
        </FormField>
      </div>

      <FormField label="Address" error={errors.address?.message}>
        <Textarea placeholder="Full address" rows={2} {...register("address")} />
      </FormField>

      <FormField label="Known Allergies" error={errors.allergies?.message}>
        <Textarea
          placeholder="List any known allergies (e.g. Penicillin, Sulfa drugs)"
          rows={2}
          {...register("allergies")}
        />
      </FormField>

      <FormField label="Chronic Conditions" error={errors.chronicConditions?.message}>
        <Textarea
          placeholder="e.g. Diabetes Type 2, Hypertension"
          rows={2}
          {...register("chronicConditions")}
        />
      </FormField>

      <FormField label="Notes" error={errors.notes?.message}>
        <Textarea
          placeholder="Any additional notes about this patient"
          rows={2}
          {...register("notes")}
        />
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
