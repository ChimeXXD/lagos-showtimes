// UTC in, Africa/Lagos out (D-06). Every time in the data is a UTC string ending in Z; every time
// on screen is Lagos time on a 24-hour clock, whatever zone the device is in.

export const LAGOS = "Africa/Lagos";

export type LagosParts = { year: number; month: number; day: number; hour: number; minute: number; weekday: string };
export type LagosLocal = Omit<LagosParts, "weekday">;

const UTC_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const HOUR = 3_600_000;
/** The evening "day" runs to 04:00 Lagos time (SPEC §3). */
const EVENING_ENDS_HOUR = 4;

const partsFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: LAGOS,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  weekday: "short",
});

/** Milliseconds since the epoch for a UTC string. Throws on anything that is not UTC with a Z. */
export function utcMs(iso: string): number {
  const ms = UTC_ISO.test(iso) ? Date.parse(iso) : NaN;
  if (Number.isNaN(ms)) throw new Error(`Not a UTC time ending in Z: "${iso}"`);
  return ms;
}

function partsAt(ms: number): LagosParts {
  const found: Record<string, string> = {};
  for (const part of partsFormat.formatToParts(ms)) found[part.type] = part.value;
  return {
    year: Number(found.year),
    month: Number(found.month),
    day: Number(found.day),
    hour: Number(found.hour),
    minute: Number(found.minute),
    weekday: found.weekday ?? "",
  };
}

const two = (n: number) => String(n).padStart(2, "0");
const dayKey = (p: LagosParts) => `${p.year}-${two(p.month)}-${two(p.day)}`;

/** The Lagos date and wall-clock time of a UTC instant. */
export function toLagos(iso: string): LagosParts {
  return partsAt(utcMs(iso));
}

/** "19:30" */
export function formatTime(iso: string): string {
  const p = toLagos(iso);
  return `${two(p.hour)}:${two(p.minute)}`;
}

/** "Fri 6 Nov" */
export function formatDate(iso: string): string {
  const p = toLagos(iso);
  return `${p.weekday} ${p.day} ${MONTHS[p.month - 1]}`;
}

/** The Lagos calendar day, "2026-11-06". */
export function lagosDayKey(iso: string): string {
  return dayKey(toLagos(iso));
}

/** The evening a showing belongs to: a 00:30 show on Saturday morning counts as Friday. */
export function eveningDayKey(iso: string): string {
  return dayKey(partsAt(utcMs(iso) - EVENING_ENDS_HOUR * HOUR));
}

/** "19:30", or "00:30 (Sat)" for a showing after midnight that is listed under the evening before. */
export function formatLateTime(iso: string): string {
  const p = toLagos(iso);
  return p.hour < EVENING_ENDS_HOUR ? `${formatTime(iso)} (${p.weekday})` : formatTime(iso);
}

/** Whole Lagos calendar days from `now` to `iso`: 0 today, 1 tomorrow, -1 yesterday. */
export function lagosDaysFrom(now: string, iso: string): number {
  const noonUtc = (p: LagosParts) => Date.UTC(p.year, p.month - 1, p.day, 12);
  return Math.round((noonUtc(toLagos(iso)) - noonUtc(toLagos(now))) / (24 * HOUR));
}

/** "Today", "Tomorrow", or "Sun 8 Nov". The day is decided in Lagos. */
export function formatDay(iso: string, now: string): string {
  const days = lagosDaysFrom(now, iso);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return formatDate(iso);
}

/**
 * A cinema's local wall-clock time as a UTC string. Parsers call this once per showing; nothing else
 * builds a time from local parts (CLAUDE.md rule 1).
 */
export function lagosLocalToUtc(local: LagosLocal): string {
  const wallAsUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
  const seen = partsAt(wallAsUtc);
  // How far Lagos's clock is ahead of UTC at that moment (one hour; read from the zone data, not assumed).
  const offset = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute) - wallAsUtc;
  const back = partsAt(wallAsUtc - offset);
  const same = (["year", "month", "day", "hour", "minute"] as const).every((k) => back[k] === local[k]);
  if (!same) throw new Error(`Not a real Lagos time: ${JSON.stringify(local)}`);
  return new Date(wallAsUtc - offset).toISOString().replace(".000Z", "Z");
}
