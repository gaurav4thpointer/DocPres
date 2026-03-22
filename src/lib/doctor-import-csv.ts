/** Column order for doctor bulk import (UTF-8 CSV). */

export const DOCTORS_IMPORT_COLUMNS = [
  "name",
  "email",
  "password",
  "defaultPrescriptionType",
  "qualification",
  "specialization",
  "registrationNo",
  "mobile",
] as const;

export type DoctorsImportColumn = (typeof DOCTORS_IMPORT_COLUMNS)[number];

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Sample file clinics can download, fill, and upload on the Doctors page. */
export function buildDoctorsImportTemplateCsv(): string {
  const header = DOCTORS_IMPORT_COLUMNS.join(",");
  const sample = [
    escapeCsvField("Dr. Sample Name"),
    escapeCsvField("doctor.sample@yourclinic.com"),
    escapeCsvField("ChangeThisPassword1"),
    "GENERAL",
    escapeCsvField("MBBS, MD"),
    escapeCsvField("General Physician"),
    escapeCsvField(""),
    escapeCsvField("+91 98765 43210"),
  ].join(",");
  return `${header}\n${sample}\n`;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

export type ParsedDoctorsCsv = {
  rows: Record<DoctorsImportColumn, string>[];
};

/**
 * Parses CSV text; first row must be a header matching DOCTORS_IMPORT_COLUMNS
 * (order may differ; extra columns ignored).
 */
export function parseDoctorsImportCsv(csvText: string): ParsedDoctorsCsv {
  const normalized = csvText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one data row");
  }

  const headerCells = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  for (const col of DOCTORS_IMPORT_COLUMNS) {
    if (!headerCells.includes(col.toLowerCase())) {
      throw new Error(`Missing required column: ${col}`);
    }
  }

  const colIndex: Partial<Record<DoctorsImportColumn, number>> = {};
  for (const col of DOCTORS_IMPORT_COLUMNS) {
    const idx = headerCells.indexOf(col.toLowerCase());
    if (idx >= 0) colIndex[col] = idx;
  }

  const rows: Record<DoctorsImportColumn, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row = {} as Record<DoctorsImportColumn, string>;
    for (const col of DOCTORS_IMPORT_COLUMNS) {
      const idx = colIndex[col]!;
      row[col] = (cells[idx] ?? "").trim();
    }
    rows.push(row);
  }

  return { rows };
}
