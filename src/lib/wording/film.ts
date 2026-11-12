import { minutesFromStart } from "@/lib/time/countdown";

// Short lines about a film and a showing, used on cards.

/** "2 h 25 min"; under an hour, "45 min". */
export const runtimeText = (minutes: number) => (minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`);

/** "2 h 25 min · 12A", or what we have; "Runtime not listed" when neither is known. */
export function filmMeta(film: { runtimeMin: number | null; rating: string | null }): string {
  return [film.runtimeMin ? runtimeText(film.runtimeMin) : null, film.rating].filter(Boolean).join(" · ") || "Runtime not listed";
}

/** "in 15 min", "in 1 h 35 min", and "now" in the last minute: how long until a showing that has not started. */
export function shortCountdown(at: string, now: string): string {
  const { minutes } = minutesFromStart(at, now);
  if (minutes === 0) return "now";
  const hours = Math.floor(minutes / 60);
  return hours === 0 ? `in ${minutes} min` : minutes % 60 === 0 ? `in ${hours} h` : `in ${hours} h ${minutes % 60} min`;
}
