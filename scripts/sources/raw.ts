// What every source parser returns: showings as the page gives them, with the start time already
// in UTC. Film titles are the source's own; matching them to film ids happens when the file is built.
import { lagosLocalToUtc } from "../../src/lib/time/lagos.ts";

export type RawShowing = {
  /** The id in data/cinemas.json. */
  cinemaId: string;
  filmTitle: string;
  /** The source's rating text ("18", "PG"), or null when it gives none. */
  rating: string | null;
  /** UTC, ending in Z. */
  startsAt: string;
  format: string | null;
  bookingUrl: string | null;
};

export type ParsedPage = {
  showings: RawShowing[];
  /** When the listing says it was built, in UTC; null when it does not say. */
  builtAt: string | null;
};

const OFFSET_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+01:00$/;

/**
 * "2026-11-11T15:50:00+01:00" to "2026-11-11T14:50:00Z", through `lagosLocalToUtc` (the only
 * local-to-UTC function). Any other offset is refused: it would not be a Lagos cinema's clock.
 */
export function lagosOffsetTimeToUtc(text: string): string {
  const found = OFFSET_TIME.exec(text.trim());
  if (!found) throw new Error(`Not a Lagos time (+01:00): "${text}"`);
  const [year, month, day, hour, minute, second] = found.slice(1).map(Number) as [number, number, number, number, number, number];
  const utc = lagosLocalToUtc({ year, month, day, hour, minute });
  return second === 0 ? utc : utc.replace(":00Z", `:${String(second).padStart(2, "0")}Z`);
}

/** Trimmed text with runs of white space collapsed, or null when nothing is left. */
export function clean(text: string | undefined): string | null {
  const tidy = (text ?? "").replace(/\s+/g, " ").trim();
  return tidy === "" ? null : tidy;
}
