export interface EyeTemplateData {
  // Visual Acuity
  visionRight?: string;
  visionLeft?: string;

  // Refraction — Right Eye
  rightEyeSphere?: string;
  rightEyeCylinder?: string;
  rightEyeAxis?: string;
  rightEyeAdd?: string;
  rightEyePrism?: string;

  // Refraction — Left Eye
  leftEyeSphere?: string;
  leftEyeCylinder?: string;
  leftEyeAxis?: string;
  leftEyeAdd?: string;
  leftEyePrism?: string;

  // Other
  pd?: string;
  diagnosisDetails?: string;
  lensAdvice?: string;
  frameAdvice?: string;
  remarks?: string;
}

export const EYE_TEMPLATE_CONFIG = {
  type: "EYE" as const,
  label: "Eye Prescription",
};

/**
 * Safely parses templateData JSON into EyeTemplateData.
 * Returns empty object if null/undefined or wrong shape — never crashes.
 */
export function parseEyeTemplateData(json: unknown): EyeTemplateData {
  if (!json || typeof json !== "object" || Array.isArray(json)) return {};
  return json as EyeTemplateData;
}

export function hasEyeData(data: EyeTemplateData): boolean {
  return Object.values(data).some((v) => v !== undefined && v !== null && v !== "");
}
