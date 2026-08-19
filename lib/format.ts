import type { AvailabilitySlot } from "@/types";

/**
 * Deterministic Hebrew date formatting. Deliberately NOT
 * `toLocaleDateString("he-IL")`: that depends on the ICU data of whatever
 * runtime renders it, so the server and the browser can disagree and
 * produce a hydration mismatch. Fixed tables render identically everywhere.
 */
const HEB_DAYS = [
  "יום ראשון",
  "יום שני",
  "יום שלישי",
  "יום רביעי",
  "יום חמישי",
  "יום שישי",
  "שבת",
] as const;

const HEB_MONTHS = [
  "בינואר",
  "בפברואר",
  "במרץ",
  "באפריל",
  "במאי",
  "ביוני",
  "ביולי",
  "באוגוסט",
  "בספטמבר",
  "באוקטובר",
  "בנובמבר",
  "בדצמבר",
] as const;

function parseIso(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayIso(): string {
  const n = new Date();
  const p = (x: number) => x.toString().padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

export function formatHebrewDate(date: string): string {
  const d = parseIso(date);
  return `${HEB_DAYS[d.getDay()]}, ${d.getDate()} ${HEB_MONTHS[d.getMonth()]}`;
}

/** "היום" / "מחר" where it applies, otherwise the full date. */
export function formatRelativeDay(date: string): string {
  const today = todayIso();
  if (date === today) return "היום";
  const t = parseIso(today);
  t.setDate(t.getDate() + 1);
  const p = (x: number) => x.toString().padStart(2, "0");
  const tomorrow = `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
  if (date === tomorrow) return "מחר";
  return formatHebrewDate(date);
}

/** Initials for the avatar, skipping the ד"ר honorific. */
export function doctorInitials(name: string): string {
  const parts = name
    .replace(/^ד["׳']ר\s*/u, "")
    .split(/\s+/)
    .filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]).join("");
}

/** Groups slots by date, each group's times ascending, dates ascending. */
export function groupSlotsByDate(
  slots: AvailabilitySlot[]
): { date: string; slots: AvailabilitySlot[] }[] {
  const byDate = new Map<string, AvailabilitySlot[]>();
  for (const slot of slots) {
    const list = byDate.get(slot.date) ?? [];
    list.push(slot);
    byDate.set(slot.date, list);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({
      date,
      slots: [...list].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
}

export function pluralSlots(count: number): string {
  if (count === 0) return "אין זמנים פנויים";
  if (count === 1) return "זמן אחד פנוי";
  return `${count} זמנים פנויים`;
}
