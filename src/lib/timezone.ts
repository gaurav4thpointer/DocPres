import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

/** IANA zone for India Standard Time (no DST). */
export const APP_TIMEZONE = "Asia/Kolkata";

/** Format an instant in IST (for display and `yyyy-MM-dd` form fields). */
export function formatInAppTimezone(date: Date | string, fmt: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const z = new TZDate(d, APP_TIMEZONE);
  return format(z, fmt);
}

/** Start of the IST calendar day containing `d`, as a UTC `Date` (for DB comparisons). */
export function startOfAppDay(d: Date): Date {
  const z = new TZDate(d, APP_TIMEZONE);
  const midnight = new TZDate(z.getFullYear(), z.getMonth(), z.getDate(), APP_TIMEZONE);
  return new Date(midnight.getTime());
}

/** `YYYY-MM-DD` for the IST calendar day of this instant. */
export function appCalendarYmd(d: Date): string {
  return formatInAppTimezone(d, "yyyy-MM-dd");
}
