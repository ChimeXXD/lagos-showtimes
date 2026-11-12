import { FORMAT_TAGS, formatTag, type FormatTag } from "@/lib/data/format";
import type { ListRow } from "@/lib/data/select";
import { EVENING_ENDS_HOUR, eveningDayKey, toLagos, utcMs, utcString } from "@/lib/time/lagos";
import { isBeforeStart, showingState } from "@/lib/time/showingState";

// A cinema's or a film's programme for one day: which rows belong to today and tomorrow, and
// how they group. The day is the evening day: a 00:30 show belongs to the evening before.

/** 0 is today, 1 is tomorrow. */
export type Day = 0 | 1;

const DAY_MS = 24 * 3_600_000;

/** Which day a showing belongs to, or null when it is neither today nor tomorrow. */
export function dayOf(at: string, now: string): Day | null {
  const evening = eveningDayKey(at);
  if (evening === eveningDayKey(now)) return 0;
  if (evening === eveningDayKey(utcString(utcMs(now) + DAY_MS))) return 1;
  return null;
}

/**
 * The instant "today" is counted from. Normally now. Between midnight and 04:00 the evening that
 * began yesterday is still today while it has a showing left to start; once it has none, today
 * is the new calendar day, so the page is not empty at 01:00 (D-54).
 */
export function anchorFor(rows: ListRow[], now: string): string {
  if (toLagos(now).hour >= EVENING_ENDS_HOUR) return now;
  const left = rows.some((row) => dayOf(row.at, now) === 0 && isBeforeStart(showingState(row.at, now)));
  return left ? now : utcString(utcMs(now) + EVENING_ENDS_HOUR * 3_600_000);
}

/**
 * An instant on today's date and one on tomorrow's, for the date under each day ("Fri 6 Nov").
 * The date is the evening's: at 01:30 on Saturday with a late show left, today is Friday and
 * tomorrow is Saturday, the same days `showingOn` puts the rows on.
 */
export function dayDates(rows: ListRow[], now: string): [string, string] {
  const today = utcMs(anchorFor(rows, now)) - EVENING_ENDS_HOUR * 3_600_000;
  return [utcString(today), utcString(today + DAY_MS)];
}

/**
 * The rows on one day, in time order. Today leaves out a showing from the second it starts (D-05).
 * With a format, only rows in that format stay; a row that gives no format is left out, not guessed.
 * `keepStarted` gives the whole day: for the page's own HTML, which does not know the time.
 */
export function showingOn(rows: ListRow[], day: Day, now: string, format: FormatTag | null = null, keepStarted = false): ListRow[] {
  const anchor = anchorFor(rows, now);
  return rows
    .filter((row) => dayOf(row.at, anchor) === day)
    .filter((row) => keepStarted || isBeforeStart(showingState(row.at, now)))
    .filter((row) => format === null || formatTag(row.format) === format)
    .sort((a, b) => a.at.localeCompare(b.at));
}

function groupBy<K extends "film" | "cinema">(rows: ListRow[], key: K): ({ rows: ListRow[] } & Record<K, number>)[] {
  const groups = new Map<number, ListRow[]>();
  for (const row of [...rows].sort((a, b) => a.at.localeCompare(b.at))) groups.set(row[key], [...(groups.get(row[key]) ?? []), row]);
  // Map keeps insertion order, and rows went in by time: the group with the soonest row is first.
  return [...groups].map(([id, list]) => ({ [key]: id, rows: list }) as { rows: ListRow[] } & Record<K, number>);
}

/** Rows grouped by film, the soonest film first. */
export const byFilm = (rows: ListRow[]) => groupBy(rows, "film");
/** Rows grouped by cinema, the soonest cinema first. */
export const byCinema = (rows: ListRow[]) => groupBy(rows, "cinema");

/** The formats these rows are showing in, in the order IMAX, 4D, 3D. */
export function formatsOf(rows: ListRow[]): FormatTag[] {
  const found = new Set(rows.map((row) => formatTag(row.format)));
  return FORMAT_TAGS.filter((tag) => found.has(tag));
}
