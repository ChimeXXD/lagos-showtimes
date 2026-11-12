import { formatDate } from "@/lib/time/lagos";

/**
 * How to name a day. "Today" and "Tomorrow" depend on the clock, so they are only said once the
 * browser has the time (`live`); before that, and in the page's own HTML, the day is its date
 * (CLAUDE.md rule 3). `date` is any instant on that day.
 */
export function dayWords(day: 0 | 1, date: string, live: boolean): { name: string; on: string } {
  if (!live) return { name: formatDate(date), on: `on ${formatDate(date)}` };
  return day === 0 ? { name: "Today", on: "today" } : { name: "Tomorrow", on: "tomorrow" };
}
