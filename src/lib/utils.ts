import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined, fmt = "dd MMM yyyy"): string {
  if (!date) return "—";
  return format(new Date(date), fmt);
}

export function calculateAge(dob: Date | string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const MEDICINE_FORMS = [
  "TABLET", "CAPSULE", "SYRUP", "OINTMENT",
  "DROPS", "INJECTION", "POWDER", "LOTION", "OTHER",
] as const;

export const MEDICINE_TIMINGS = [
  { value: "BEFORE_FOOD", label: "Before Food" },
  { value: "AFTER_FOOD", label: "After Food" },
  { value: "EMPTY_STOMACH", label: "Empty Stomach" },
  { value: "ANYTIME", label: "Anytime" },
] as const;

export const GENDERS: { value: string; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export const FREQUENCIES = [
  "Once daily (OD)",
  "Twice daily (BD)",
  "Thrice daily (TDS)",
  "Four times daily (QID)",
  "Once weekly",
  "Twice weekly",
  "Every 8 hours",
  "Every 12 hours",
  "As needed (SOS)",
  "At bedtime (HS)",
];

export const DURATIONS = [
  "3 days", "5 days", "7 days", "10 days",
  "14 days", "1 month", "2 months", "3 months",
  "Continue", "As needed",
];

export const DOSAGES = [
  "1 tablet", "2 tablets", "1/2 tablet",
  "5 ml", "10 ml", "15 ml",
  "1 capsule", "2 capsules",
  "Apply locally", "2 drops", "4 drops",
  "1 injection",
];
