// The pure steps between a parser's rows and the data files: film ids, sample dates (D-20),
// building and validating schema v1, and the per-area split (D-18). No file or network access.
import type { Cinema, Film, Showing, ShowtimesFile, Source } from "../src/lib/data/types.ts";
import { validateShowtimes } from "../src/lib/data/validate.ts";
import { EVENING_ENDS_HOUR, lagosDaysFrom, lagosLocalToUtc, toLagos } from "../src/lib/time/lagos.ts";
import type { RawShowing } from "./sources/raw.ts";

/** One read of one source: its rows and when they were read. */
export type Batch = {
  sourceId: string;
  /** When we read the source (for a fixture: when the page was saved). */
  fetchedAt: string;
  /** When the source says it built its listing, if it says. */
  builtAt: string | null;
  /** True for a listing that compiles other sites (Lagocine): its rows then say which site it read. */
  through: boolean;
  showings: RawShowing[];
};

// "(IMAX)", "[3D]", "(IMAX 2D)" at the end of a title: a format, not part of the film's name.
const FORMAT_SUFFIX = /\s*[([]\s*(imax(?: [23]d)?|[234]d|4dx|mx4d|screenx)\s*[)\]]\s*$/i;
const UNKNOWN_CREDITS = { during: "unknown", after: "unknown", confidence: "unknown", sources: [], count: null } as const;

/** The title as shown: white space tidied and any format suffix removed. */
export function filmTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim().replace(FORMAT_SUFFIX, "");
}

/** The format a title ends with ("Ramayana (IMAX)" gives "IMAX"), or null. */
export function titleFormat(title: string): string | null {
  const found = FORMAT_SUFFIX.exec(title.replace(/\s+/g, " ").trim());
  return found ? (found[1] as string).toUpperCase() : null;
}

/** "Arnie & Barney" to "arnie-and-barney". The same film written two ways should give one id. */
export function filmIdFromTitle(title: string): string {
  const id = filmTitle(title)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (id === "") throw new Error(`Cannot make a film id from the title "${title}"`);
  return id;
}

/** The Lagos calendar date `days` after today. */
function lagosDate(now: string, days: number): { year: number; month: number; day: number } {
  const today = toLagos(now);
  const date = new Date(Date.UTC(today.year, today.month - 1, today.day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/**
 * Sample data sits on today's dates (D-20): rows from the day the fixtures were saved move onto
 * today and rows from the day after onto tomorrow, keeping their wall-clock times. Later days are
 * dropped. A cinema with no saved tomorrow gets its saved day again (D-45). Booking links go: they
 * point at a session on the day the page was saved.
 */
export function toSampleDays(rows: RawShowing[], savedDay: string, now: string): RawShowing[] {
  const savedNoon = `${savedDay}T11:00:00Z`; // noon in Lagos
  const dayOf = (row: RawShowing) => lagosDaysFrom(savedNoon, row.startsAt);
  const move = (row: RawShowing, days: number): RawShowing => {
    const { hour, minute } = toLagos(row.startsAt);
    return { ...row, startsAt: lagosLocalToUtc({ ...lagosDate(now, days), hour, minute }), bookingUrl: null };
  };
  // A show after midnight belongs to the evening before (SPEC §3): on its own it is not a saved tomorrow.
  const isTomorrow = (row: RawShowing) => dayOf(row) === 1 && toLagos(row.startsAt).hour >= EVENING_ENDS_HOUR;
  const hasTomorrow = new Set(rows.filter(isTomorrow).map((row) => row.cinemaId));
  const moved = rows.filter((row) => dayOf(row) === 0 || dayOf(row) === 1).map((row) => move(row, dayOf(row)));
  const repeated = rows.filter((row) => dayOf(row) === 0 && !hasTomorrow.has(row.cinemaId)).map((row) => move(row, 1));
  return [...moved, ...repeated];
}

/** Rows to a validated schema v1 file. Throws if the validator refuses it. */
export function buildShowtimes(input: {
  generatedAt: string;
  sources: Source[];
  cinemas: Cinema[];
  batches: Batch[];
  /** What data/credits.json and Chime's own entries say about a film, if anything. */
  creditsFor?: (filmId: string) => Pick<Film, "tmdbId" | "runtimeMin" | "credits"> | undefined;
}): {
  file: ShowtimesFile;
  log: string[];
} {
  const log: string[] = [];
  const cinemaById = new Map(input.cinemas.map((cinema) => [cinema.id, cinema]));
  const films = new Map<string, Film>();
  const showings: Showing[] = [];

  for (const batch of input.batches) {
    const seen = new Set<string>();
    const unknown = new Map<string, number>();
    let repeats = 0;
    for (const row of batch.showings) {
      const cinema = cinemaById.get(row.cinemaId);
      if (!cinema) {
        unknown.set(row.cinemaId, (unknown.get(row.cinemaId) ?? 0) + 1);
        continue;
      }
      const filmId = filmIdFromTitle(row.filmTitle);
      const film = films.get(filmId);
      if (!film) {
        films.set(filmId, {
          id: filmId, title: filmTitle(row.filmTitle), runtimeMin: null, rating: row.rating, origin: null, tmdbId: null,
          credits: { ...UNKNOWN_CREDITS, sources: [] },
          ...input.creditsFor?.(filmId),
        });
      } else if (film.rating === null) {
        film.rating = row.rating;
      }
      const id = `${cinema.id}_${filmId}_${row.startsAt}`;
      // The same showing twice in one read is one showing: a day page and a cinema page overlap,
      // and Lagocine repeats some rows outright.
      if (seen.has(id)) {
        repeats += 1;
        continue;
      }
      seen.add(id);
      const readTheirSite = batch.through && (cinema.website !== null || Boolean(cinema.bookingHost));
      showings.push({
        id, filmId, cinemaId: cinema.id, screenId: null, startsAt: row.startsAt, format: row.format ?? titleFormat(row.filmTitle), language: null,
        price: null, bookingUrl: row.bookingUrl, sourceId: batch.sourceId,
        ...(readTheirSite
          ? { via: { name: `${cinema.chain}'s site`, ...(cinema.website ? { url: cinema.website } : {}), fetchedAt: batch.builtAt ?? batch.fetchedAt } }
          : {}),
        fetchedAt: batch.fetchedAt,
      });
    }
    for (const [cinemaId, count] of unknown) log.push(`${batch.sourceId}: dropped ${count} showings at "${cinemaId}", which is not in data/cinemas.json`);
    if (repeats > 0) log.push(`${batch.sourceId}: ${repeats} showings were listed more than once; kept one of each`);
  }

  showings.sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id));
  const result = validateShowtimes({
    schemaVersion: 1, generatedAt: input.generatedAt, timeZone: "Africa/Lagos",
    sources: input.sources, cinemas: input.cinemas, films: [...films.values()].sort((a, b) => a.id.localeCompare(b.id)), showings,
  });
  if (!result.ok) throw new Error(`The data file was refused:\n${result.errors.join("\n")}`);
  return { file: only(result.file, result.file.cinemas, () => true), log: [...log, ...result.log] };
}

/** The file cut down to some cinemas and showings, with only the films and sources those showings use. */
function only(file: ShowtimesFile, cinemas: Cinema[], keep: (showing: Showing) => boolean): ShowtimesFile {
  const cinemaIds = new Set(cinemas.map((cinema) => cinema.id));
  const showings = file.showings.filter((showing) => cinemaIds.has(showing.cinemaId) && keep(showing));
  const filmIds = new Set(showings.map((showing) => showing.filmId));
  const sourceIds = new Set(showings.map((showing) => showing.sourceId));
  return {
    ...file,
    sources: file.sources.filter((source) => sourceIds.has(source.id)),
    cinemas,
    films: file.films.filter((film) => filmIds.has(film.id)),
    showings,
  };
}

/**
 * One file per area plus "all" (D-18), each holding today's and tomorrow's showings. Tomorrow
 * runs to 04:00 the morning after, so a 00:30 show stays with its evening.
 */
export function splitByArea(file: ShowtimesFile, areaSlugs: string[], now: string): Map<string, ShowtimesFile> {
  const end = lagosLocalToUtc({ ...lagosDate(now, 2), hour: EVENING_ENDS_HOUR, minute: 0 });
  const soon = (showing: Showing) => showing.startsAt < end;
  const files = new Map([["all", only(file, file.cinemas, soon)]]);
  for (const slug of areaSlugs) files.set(slug, only(file, file.cinemas.filter((cinema) => cinema.area === slug), soon));
  return files;
}
