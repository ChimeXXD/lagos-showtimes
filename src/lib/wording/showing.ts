import { countdown, minutesFromStart } from "@/lib/time/countdown";
import { formatDay, formatLateTime, formatTime } from "@/lib/time/lagos";

// Sentences about one showing (D-05, DATA §Showing wording). Relative words come from `now`,
// so these run in the browser.

/** "19:30 · Starts in 1 h 20 min", or null once the showing has ended (it is hidden). */
export function showingLine(startsAt: string, now: string): string | null {
  const when = countdown(startsAt, now);
  return when === null ? null : `${formatLateTime(startsAt)} · ${when}`;
}

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

/** The countdown with its units spelled out, for screen readers: "starts in 1 hour 20 minutes". */
function spokenCountdown(startsAt: string, now: string): string | null {
  const { state, minutes } = minutesFromStart(startsAt, now);
  if (state === "ended") return null;
  if (state === "started") return minutes === 0 ? "started just now" : `started ${plural(minutes, "minute")} ago`;
  if (minutes === 0) return "starting now";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const length = [hours > 0 ? plural(hours, "hour") : "", rest > 0 ? plural(rest, "minute") : ""].filter(Boolean).join(" ");
  return `starts in ${length}`;
}

/**
 * The whole row as one sentence (SPEC §7): "Sinners, Filmhouse Lekki, today at 19:30, starts in
 * 45 minutes. Read from Filmhouse's site 2 hours ago." Null once the showing has ended.
 */
export function showingSentence(row: { film: string; cinema: string; startsAt: string; freshness: string }, now: string): string | null {
  const when = spokenCountdown(row.startsAt, now);
  if (when === null) return null;
  const day = formatDay(row.startsAt, now);
  const spokenDay = day === "Today" || day === "Tomorrow" ? day.toLowerCase() : day;
  return `${row.film}, ${row.cinema}, ${spokenDay} at ${formatTime(row.startsAt)}, ${when}. ${row.freshness}.`;
}
