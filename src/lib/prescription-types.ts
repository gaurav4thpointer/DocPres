import type { PrescriptionType } from "@prisma/client";

export type { PrescriptionType };

export interface PrescriptionTypeConfig {
  label: string;
  description: string;
}

export const PRESCRIPTION_TYPE_CONFIG: Record<PrescriptionType, PrescriptionTypeConfig> = {
  GENERAL: {
    label: "General Prescription",
    description: "Standard prescription with medicines, investigations, and advice.",
  },
  EYE: {
    label: "Eye Prescription",
    description: "Includes optical refraction, visual acuity, and lens/frame advice.",
  },
};

export const PRESCRIPTION_TYPE_OPTIONS = (
  Object.keys(PRESCRIPTION_TYPE_CONFIG) as PrescriptionType[]
).map((key) => ({
  value: key,
  label: PRESCRIPTION_TYPE_CONFIG[key].label,
  description: PRESCRIPTION_TYPE_CONFIG[key].description,
}));
