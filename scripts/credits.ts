// Stay or Go, before any wording: which TMDB film a cinema's title means, what TMDB's keywords
// say, and how Chime's own entries override them (D-10, D-19, D-25). Pure; scripts/tmdb.ts does
// the reading and writing.
import type { CreditsAnswer, CreditsInfo, CreditsSource } from "../src/lib/data/types.ts";
import { filmIdFromTitle } from "./pipeline.ts";

/** TMDB keyword ids: `aftercreditsstinger` and `duringcreditsstinger`. */
export const AFTER_CREDITS = 179430;
export const DURING_CREDITS = 179431;

export type TmdbResult = { id: number; title: string; original_title?: string; release_date?: string };
/** What one TMDB film told us, and when we asked. */
export type TmdbFilm = { tmdbId: number; runtimeMin: number | null; keywordIds: number[]; checkedAt: string };
export type ManualEntry = { during: string; after: string; source: CreditsSource };
export type FilmCredits = { tmdbId: number | null; runtimeMin: number | null; credits: CreditsInfo };

const UTC_SECONDS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
// A film in cinemas now came out recently or is about to: old films with the same title are remakes' namesakes.
const MONTHS_BACK = 18;
const MONTHS_AHEAD = 4;

const unknown = (): CreditsInfo => ({ during: "unknown", after: "unknown", confidence: "unknown", sources: [], count: null });

function sameTitle(ours: string, theirs: string | undefined): boolean {
  if (!theirs) return false;
  try {
    return filmIdFromTitle(theirs) === ours;
  } catch {
    return false; // a title with no Latin letters or digits cannot equal one of ours
  }
}

/** `today` moved by whole months, as yyyy-mm-dd. */
function monthsFrom(today: string, months: number): string {
  const [year, month, day] = today.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1 + months, day)).toISOString().slice(0, 10);
}

/**
 * The TMDB id for a cinema's title, or null. Only an exact title (however it is written) on one
 * current film counts: a wrong match would put the wrong credits answer on a film, so anything
 * ambiguous stays unmatched and reads "not known yet". `today` is yyyy-mm-dd.
 */
export function pickMatch(title: string, results: TmdbResult[], today: string): number | null {
  const ours = filmIdFromTitle(title);
  const from = monthsFrom(today, -MONTHS_BACK);
  const to = monthsFrom(today, MONTHS_AHEAD);
  const current = results.filter(
    (result) =>
      (sameTitle(ours, result.title) || sameTitle(ours, result.original_title)) &&
      result.release_date !== undefined && result.release_date >= from && result.release_date <= to,
  );
  return current.length === 1 ? (current[0] as TmdbResult).id : null;
}

/** A keyword is a person's statement that there is a scene. No keyword says nothing: never "no". */
export function creditsFromKeywords(tmdbId: number, keywordIds: number[], checkedAt: string): CreditsInfo {
  const after: CreditsAnswer = keywordIds.includes(AFTER_CREDITS) ? "yes" : "unknown";
  const during: CreditsAnswer = keywordIds.includes(DURING_CREDITS) ? "yes" : "unknown";
  if (after !== "yes" && during !== "yes") return unknown();
  return { during, after, confidence: "confirmed", sources: [{ name: "TMDB", url: `https://www.themoviedb.org/movie/${tmdbId}`, checkedAt }], count: null };
}

/** One entry of data/credits-manual.json as credits. Throws on an entry that could not be cited. */
export function manualCredits(filmId: string, entry: ManualEntry): CreditsInfo {
  const fail = (message: string): never => {
    throw new Error(`data/credits-manual.json, ${filmId}: ${message}`);
  };
  for (const key of ["during", "after"] as const) {
    if (entry[key] !== "yes" && entry[key] !== "no") fail(`${key} must be "yes" or "no"`);
  }
  const source = entry.source;
  if (!source || typeof source.name !== "string" || source.name.trim() === "") fail("needs a source name");
  if (typeof source.url !== "string" || !source.url.startsWith("https://")) fail("needs an https link");
  if (typeof source.checkedAt !== "string" || !UTC_SECONDS.test(source.checkedAt)) fail("needs a checkedAt like 2026-11-10T09:00:00Z");
  return { during: entry.during as CreditsAnswer, after: entry.after as CreditsAnswer, confidence: "confirmed", sources: [source], count: null };
}

/** One entry per film showing: TMDB's id, runtime and keyword answer, with a manual entry on top. */
export function mergeCredits(input: { filmIds: string[]; tmdb: Record<string, TmdbFilm>; manual: Record<string, ManualEntry> }): Record<string, FilmCredits> {
  const merged: Record<string, FilmCredits> = {};
  for (const filmId of input.filmIds) {
    const found = Object.hasOwn(input.tmdb, filmId) ? input.tmdb[filmId] : undefined;
    const entry = Object.hasOwn(input.manual, filmId) ? input.manual[filmId] : undefined;
    merged[filmId] = {
      tmdbId: found?.tmdbId ?? null,
      runtimeMin: found?.runtimeMin ?? null,
      credits: entry ? manualCredits(filmId, entry) : found ? creditsFromKeywords(found.tmdbId, found.keywordIds, found.checkedAt) : unknown(),
    };
  }
  return merged;
}

/** How many films have a Stay or Go answer, for the build log (D-19). */
export function answerShare(credits: Record<string, FilmCredits>): { answered: number; total: number; text: string } {
  const all = Object.values(credits);
  const answered = all.filter(({ credits: c }) => c.during === "yes" || c.after === "yes" || (c.during === "no" && c.after === "no")).length;
  const percent = all.length > 0 ? ` (${Math.round((answered / all.length) * 100)}%)` : "";
  return { answered, total: all.length, text: `${answered} of ${all.length} films have a credits answer${percent}` };
}
