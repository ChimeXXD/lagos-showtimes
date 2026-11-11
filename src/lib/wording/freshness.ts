import type { SourceMethod, Via } from "@/lib/data/types";
import { formatDate, formatTime, lagosDaysFrom, toLagos, utcMs } from "@/lib/time/lagos";

// The only place freshness sentences are written (D-04, DATA §Freshness). Computed in the browser
// from `now`; never baked into static HTML.

export type FreshnessBand = "fresh" | "today" | "stale" | "old" | "sample";
export type Freshness = { band: FreshnessBand; text: string; /** Old and sample rows cannot be booked (D-25). */ bookable: boolean };

const MIN = 60_000;
const HOUR = 60 * MIN;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "Read from Filmhouse's site 2 hours ago". With `via`, the sentence names both and the age is the
 * original site's: "From Lagocine, which read EbonyLife's site 2 hours ago".
 */
export function freshness(source: { name: string; method: SourceMethod }, fetchedAt: string, now: string, via?: Via | null): Freshness {
  if (source.method === "fixture") {
    const saved = toLagos(fetchedAt);
    return { band: "sample", text: `Sample data saved from ${source.name} on ${saved.day} ${MONTHS[saved.month - 1]}`, bookable: false };
  }

  const readAt = via ? via.fetchedAt : fetchedAt;
  const read = via ? `From ${source.name}, which read ${via.name}` : `Read from ${source.name}`;
  const lastRead = via ? `From ${source.name}, which last read ${via.name}` : `Last read from ${source.name}`;
  const age = Math.max(0, utcMs(now) - utcMs(readAt)); // a read time just ahead of the device clock is "just now"

  if (age < MIN) return { band: "fresh", text: `${read} just now`, bookable: true };
  if (age < HOUR) return { band: "fresh", text: `${read} ${Math.floor(age / MIN)} min ago`, bookable: true };
  if (age < 6 * HOUR) {
    const hours = Math.floor(age / HOUR);
    return { band: "fresh", text: `${read} ${hours} ${hours === 1 ? "hour" : "hours"} ago`, bookable: true };
  }

  const daysAgo = -lagosDaysFrom(now, readAt);
  if (daysAgo <= 0) return { band: "today", text: `${read} today at ${formatTime(readAt)}`, bookable: true };
  if (daysAgo === 1) return { band: "stale", text: `${read} yesterday at ${formatTime(readAt)} · check with the cinema`, bookable: true };
  return { band: "old", text: `${lastRead} ${formatDate(readAt)} · may have changed`, bookable: false };
}
