import type { ShowtimesFile } from "./types.ts";

// Enforces every rule in docs/DATA.md §Rules. A broken file is refused with every problem named;
// a broken row is dropped or repaired and the log says so. The input is never changed.
// Relative imports with ".ts" so the refresh script can run this file under plain Node.

export type Validation =
  | { ok: true; file: ShowtimesFile; log: string[] }
  | { ok: false; errors: string[] };

export type ValidateOptions = {
  /** A scheduled run may only hold cleared sources (D-08). */
  scheduled?: boolean;
};

type Row = Record<string, unknown>;

const METHODS = ["permission-feed", "public-page", "api", "fixture"];
const STATUSES = ["cleared", "pending", "refused", "do-not-use"];
const ANSWERS = ["yes", "no", "unknown"];
const CONFIDENCES = ["confirmed", "likely", "unknown"];
const UTC_SECONDS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const TRACKING = /^(utm_.+|fbclid|gclid|dclid|gbraid|wbraid|msclkid|yclid|twclid|ttclid|igshid|mc_cid|mc_eid|_hsenc|_hsmi)$/i;
const MIN = 60_000;
/** A showing has ended 30 min after its start (D-05); it leaves the file an hour after that. */
const KEEP_AFTER_START = 90 * MIN;

const isRow = (value: unknown): value is Row => typeof value === "object" && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === "string" && value !== "";
const show = (value: unknown) => (value === undefined ? "undefined" : JSON.stringify(value));

/** UTC with a Z, to the second, and a real date ("2026-02-30" is refused). */
function isUtc(value: unknown): value is string {
  if (typeof value !== "string" || !UTC_SECONDS.test(value)) return false;
  const ms = Date.parse(value);
  return !Number.isNaN(ms) && new Date(ms).toISOString() === value.replace("Z", ".000Z");
}

const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, "");

/** Why a booking link cannot be used, or null when it can. */
function bookingProblem(url: unknown, cinema: Row): string | null {
  if (typeof url !== "string" || !URL.canParse(url)) return "it is not a URL";
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") return "it is not https";
  const allowed: string[] = [];
  if (isText(cinema.bookingHost)) allowed.push(bareHost(cinema.bookingHost));
  if (isText(cinema.website) && URL.canParse(cinema.website)) allowed.push(bareHost(new URL(cinema.website).hostname));
  const host = bareHost(parsed.hostname);
  if (!allowed.some((own) => host === own || host.endsWith(`.${own}`))) {
    return `${parsed.hostname} is not the cinema's own site or its booking engine`;
  }
  const tracker = [...parsed.searchParams.keys()].find((key) => TRACKING.test(key));
  return tracker ? `it carries the tracking parameter ${tracker}` : null;
}

export function validateShowtimes(input: unknown, options: ValidateOptions = {}): Validation {
  if (!isRow(input)) return { ok: false, errors: ["The file is not an object"] };
  const file = structuredClone(input);
  const errors: string[] = [];
  const log: string[] = [];

  const needUtc = (value: unknown, where: string) => {
    if (!isUtc(value)) errors.push(`${where} must be a UTC time like 2026-11-06T18:30:00Z, got ${show(value)}`);
  };
  const needText = (value: unknown, where: string) => {
    if (!isText(value)) errors.push(`${where} must be a non-empty string, got ${show(value)}`);
  };
  const needOneOf = (value: unknown, choices: string[], where: string) => {
    if (!choices.includes(value as string)) errors.push(`${where} must be one of ${choices.join(", ")}, got ${show(value)}`);
  };

  if (file.schemaVersion !== 1) errors.push(`schemaVersion must be 1, got ${show(file.schemaVersion)}`);
  needUtc(file.generatedAt, "generatedAt");
  if (file.timeZone !== "Africa/Lagos") errors.push(`timeZone must be "Africa/Lagos", got ${show(file.timeZone)}`);
  if (file.sample !== undefined && typeof file.sample !== "boolean") errors.push(`sample must be true or false, got ${show(file.sample)}`);

  // Every list must be there, and every row must be an object with an id no other row has.
  const lists: Record<string, Row[]> = {};
  for (const name of ["sources", "cinemas", "films", "showings"]) {
    const list = file[name];
    if (!Array.isArray(list)) {
      errors.push(`${name} must be a list`);
      lists[name] = [];
      continue;
    }
    const seen = new Set<unknown>();
    list.forEach((row, i) => {
      if (!isRow(row)) return errors.push(`${name}[${i}] must be an object, got ${show(row)}`);
      needText(row.id, `${name}[${i}].id`);
      // Two showings may share an id only as duplicates, which are settled below.
      if (name !== "showings" && isText(row.id) && seen.has(row.id)) errors.push(`${name}[${i}].id ${show(row.id)} is used twice`);
      seen.add(row.id);
    });
    lists[name] = list.filter(isRow);
  }
  const { sources = [], cinemas = [], films = [], showings = [] } = lists;

  sources.forEach((source, i) => {
    const at = `sources[${i}]`;
    needText(source.name, `${at}.name`);
    needOneOf(source.method, METHODS, `${at}.method`);
    needOneOf(source.status, STATUSES, `${at}.status`);
    if (source.fetchedAt !== null) needUtc(source.fetchedAt, `${at}.fetchedAt`);
    if (source.lastOkAt !== null) needUtc(source.lastOkAt, `${at}.lastOkAt`);
    if (options.scheduled && STATUSES.includes(source.status as string) && source.status !== "cleared") {
      errors.push(`${at} ${show(source.id)} is ${String(source.status)}: only cleared sources run on a schedule (D-08)`);
    }
  });
  cinemas.forEach((cinema, i) => {
    needText(cinema.name, `cinemas[${i}].name`);
    needText(cinema.area, `cinemas[${i}].area`);
  });
  films.forEach((film, i) => {
    needText(film.title, `films[${i}].title`);
    if (film.credits === undefined || film.credits === null) return;
    if (!isRow(film.credits)) return errors.push(`films[${i}].credits must be an object, got ${show(film.credits)}`);
    needOneOf(film.credits.during, ANSWERS, `films[${i}].credits.during`);
    needOneOf(film.credits.after, ANSWERS, `films[${i}].credits.after`);
    needOneOf(film.credits.confidence, CONFIDENCES, `films[${i}].credits.confidence`);
    // The wording reads every source's name, url and checkedAt, so each must at least be text.
    const named = film.credits.sources;
    const sound = Array.isArray(named) && named.every((s) => isRow(s) && [s.name, s.url, s.checkedAt].every((v) => typeof v === "string"));
    if (!sound) errors.push(`films[${i}].credits.sources must be a list of { name, url, checkedAt }, got ${show(named)}`);
  });
  showings.forEach((showing, i) => {
    const at = `showings[${i}]`;
    for (const key of ["filmId", "cinemaId", "sourceId"]) needText(showing[key], `${at}.${key}`);
    needUtc(showing.startsAt, `${at}.startsAt`);
    // A missing fetchedAt drops the row (below); one that is there must still be UTC.
    if (showing.fetchedAt !== undefined && showing.fetchedAt !== null) needUtc(showing.fetchedAt, `${at}.fetchedAt`);
    if (showing.via !== undefined && showing.via !== null) {
      if (!isRow(showing.via)) return errors.push(`${at}.via must be an object, got ${show(showing.via)}`);
      needText(showing.via.name, `${at}.via.name`);
      needUtc(showing.via.fetchedAt, `${at}.via.fetchedAt`);
    }
  });

  if (errors.length > 0) return { ok: false, errors };

  // From here the file is sound; single rows are dropped or repaired, and the log says so.
  const byId = (rows: Row[]) => new Map(rows.map((row) => [row.id, row]));
  const sourceById = byId(sources);
  const cinemaById = byId(cinemas);
  const filmById = byId(films);

  for (const film of films) {
    const credits = film.credits as Row | null | undefined;
    if (!credits) continue;
    const hasSource = Array.isArray(credits.sources) && credits.sources.length > 0;
    if (!hasSource && (credits.during === "no" || credits.after === "no")) {
      if (credits.during === "no") credits.during = "unknown";
      if (credits.after === "no") credits.after = "unknown";
      if (credits.during !== "yes" && credits.after !== "yes") credits.confidence = "unknown";
      log.push(`Film ${String(film.id)}: credits "no" has no source, so it is now "unknown"`);
    }
  }

  let kept = showings.filter((showing) => {
    const drop = (why: string) => (log.push(`Dropped showing ${String(showing.id)}: ${why}`), false);
    if (showing.fetchedAt === undefined || showing.fetchedAt === null) return drop("it has no fetchedAt");
    if (!sourceById.has(showing.sourceId)) return drop(`its source ${show(showing.sourceId)} is not in the file`);
    if (!filmById.has(showing.filmId)) return drop(`its film ${show(showing.filmId)} is not in the file`);
    if (!cinemaById.has(showing.cinemaId)) return drop(`its cinema ${show(showing.cinemaId)} is not in the file`);
    return true;
  });

  const generatedAt = file.generatedAt as string;
  const cutoff = Date.parse(generatedAt) - KEEP_AFTER_START;
  const live = kept.filter((showing) => Date.parse(showing.startsAt as string) >= cutoff);
  const ended = kept.length - live.length;
  if (ended > 0) log.push(`Removed ${ended} ${ended === 1 ? "showing" : "showings"} that ended more than an hour before ${generatedAt}`);
  kept = live;

  for (const showing of kept) {
    // A missing link or price is unknown, and unknown is null (types.ts), so no reader sees undefined.
    showing.bookingUrl ??= null;
    showing.price ??= null;
    if (showing.bookingUrl !== null) {
      const problem = bookingProblem(showing.bookingUrl, cinemaById.get(showing.cinemaId) as Row);
      if (problem) {
        showing.bookingUrl = null;
        log.push(`Removed the booking link from showing ${String(showing.id)}: ${problem}`);
      }
    }
    if (showing.price !== null) {
      const amount = isRow(showing.price) ? showing.price.amountNgn : undefined;
      if (!Number.isInteger(amount) || (amount as number) < 0) {
        showing.price = null;
        log.push(`Dropped the price from showing ${String(showing.id)}: amountNgn must be a whole number of naira`);
      }
    }
  }

  // One row per film, cinema and start time: the most recently fetched wins, the first on a tie.
  const keyOf = (showing: Row) => `${String(showing.cinemaId)}|${String(showing.filmId)}|${String(showing.startsAt)}`;
  const newest = new Map<string, Row>();
  for (const showing of kept) {
    const rival = newest.get(keyOf(showing));
    if (!rival || (showing.fetchedAt as string) > (rival.fetchedAt as string)) newest.set(keyOf(showing), showing);
  }
  // An id is a page's key for its row, so a second showing that reuses one cannot stay either.
  const usedIds = new Set<unknown>();
  kept = kept.filter((showing) => {
    const winner = newest.get(keyOf(showing)) as Row;
    if (winner !== showing) {
      log.push(`Dropped a duplicate of ${String(winner.id)} (kept the copy fetched at ${String(winner.fetchedAt)})`);
      return false;
    }
    if (usedIds.has(showing.id)) {
      log.push(`Dropped showing ${String(showing.id)} (${String(showing.startsAt)}): another showing already has that id`);
      return false;
    }
    usedIds.add(showing.id);
    return true;
  });
  file.showings = kept;

  const fromFixtures = kept.filter((showing) => sourceById.get(showing.sourceId)?.method === "fixture").length;
  if (file.sample === undefined) {
    file.sample = fromFixtures > 0;
  } else if (file.sample === false && fromFixtures > 0) {
    file.sample = true;
    log.push(`sample was false but ${fromFixtures} ${fromFixtures === 1 ? "showing comes" : "showings come"} from a fixture, so it is now true`);
  }

  return { ok: true, file: file as unknown as ShowtimesFile, log };
}
