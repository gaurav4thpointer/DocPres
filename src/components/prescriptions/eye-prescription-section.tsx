"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import type { EyeTemplateData } from "@/lib/prescription-templates/eye";
import { Eye } from "lucide-react";

interface Props {
  value: EyeTemplateData;
  onChange: (data: EyeTemplateData) => void;
  readOnly?: boolean;
}

type RefractionField = "Sphere" | "Cylinder" | "Axis" | "Add" | "Prism";

const REFRACTION_ROWS: { label: RefractionField; rightKey: keyof EyeTemplateData; leftKey: keyof EyeTemplateData }[] = [
  { label: "Sphere",   rightKey: "rightEyeSphere",   leftKey: "leftEyeSphere" },
  { label: "Cylinder", rightKey: "rightEyeCylinder",  leftKey: "leftEyeCylinder" },
  { label: "Axis",     rightKey: "rightEyeAxis",     leftKey: "leftEyeAxis" },
  { label: "Add",      rightKey: "rightEyeAdd",      leftKey: "leftEyeAdd" },
  { label: "Prism",    rightKey: "rightEyePrism",    leftKey: "leftEyePrism" },
];

export function EyePrescriptionSection({ value, onChange, readOnly = false }: Props) {
  const set = (key: keyof EyeTemplateData, v: string) =>
    onChange({ ...value, [key]: v || undefined });

  const field = (key: keyof EyeTemplateData) => ({
    value: value[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value),
    readOnly,
    disabled: readOnly,
  });

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-sky-600" />
        <p className="text-sm font-semibold text-sky-700">Eye Prescription</p>
        <div className="flex-1 h-px bg-sky-100" />
      </div>

      {/* Visual Acuity */}
      <Card className="border-sky-100">
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Visual Acuity
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Right Eye (RE)">
              <Input placeholder="e.g. 6/6, 6/9, CF" {...field("visionRight")} />
            </FormField>
            <FormField label="Left Eye (LE)">
              <Input placeholder="e.g. 6/6, 6/12, HM" {...field("visionLeft")} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Refraction */}
      <Card className="border-sky-100">
        <CardContent className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Refraction
          </p>

          {/* Column headers */}
          <div className="grid grid-cols-3 gap-3 mb-2 px-1">
            <div className="text-xs font-medium text-gray-400">Parameter</div>
            <div className="text-xs font-medium text-sky-600 text-center">Right Eye (RE)</div>
            <div className="text-xs font-medium text-indigo-600 text-center">Left Eye (LE)</div>
          </div>

          <div className="space-y-2">
            {REFRACTION_ROWS.map(({ label, rightKey, leftKey }) => (
              <div key={label} className="grid grid-cols-3 gap-3 items-center">
                <div className="text-sm font-medium text-gray-700 pl-1">{label}</div>
                <Input
                  placeholder={label === "Axis" ? "e.g. 180" : "e.g. -2.00"}
                  className="text-center text-sm"
                  {...field(rightKey)}
                />
                <Input
                  placeholder={label === "Axis" ? "e.g. 170" : "e.g. -1.50"}
                  className="text-center text-sm"
                  {...field(leftKey)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other Details */}
      <Card className="border-sky-100">
        <CardContent className="p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Other Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="PD (Pupillary Distance)">
              <Input placeholder="e.g. 62 mm or 31/31" {...field("pd")} />
            </FormField>
            <FormField label="Diagnosis Details">
              <Input placeholder="e.g. Myopia, Presbyopia" {...field("diagnosisDetails")} />
            </FormField>
            <FormField label="Lens Advice">
              <Input placeholder="e.g. Anti-reflective, Photochromic" {...field("lensAdvice")} />
            </FormField>
            <FormField label="Frame Advice">
              <Input placeholder="e.g. Full frame, Rimless" {...field("frameAdvice")} />
            </FormField>
          </div>
          <FormField label="Remarks">
            <Textarea
              placeholder="Additional notes or instructions for the patient"
              rows={2}
              value={value.remarks ?? ""}
              onChange={(e) => set("remarks", e.target.value)}
              readOnly={readOnly}
              disabled={readOnly}
            />
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
}
