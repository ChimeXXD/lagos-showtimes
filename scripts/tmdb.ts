// Match the films now showing to TMDB and read their credits keywords, at build time only
// (D-09, D-10). Writes data/credits.json, which `refresh` merges into the data files.
//
//   node scripts/tmdb.ts --dry-run     what would be looked up, and the share already answered; no network
//   node scripts/tmdb.ts               needs TMDB_READ_TOKEN in .env.local or the environment
//
// The token never leaves this script: it is not printed, not written, and never in client code.
// TMDB data may be kept at most 6 months (D-31); an entry older than a week is asked again.
// NOT YET RUN AGAINST THE LIVE API (no key on 11 Nov 2026): the request paths and response
// fields below follow TMDB's v3 documentation and need a first real run to confirm.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Film } from "../src/lib/data/types.ts";
import { lagosDayKey } from "../src/lib/time/lagos.ts";
import { answerShare, mergeCredits, pickMatch, type ManualEntry, type TmdbFilm, type TmdbResult } from "./credits.ts";
import { refreshFromFixtures } from "./refresh.ts";

const API = "https://api.themoviedb.org/3";
const WEEK_MS = 7 * 24 * 3_600_000;
/** Between requests. TMDB states no limit (D-31); this keeps us far from any. */
const GAP_MS = 300;

export type CreditsFile = { schemaVersion: 1; about: string; tmdb: Record<string, TmdbFilm & { tmdbTitle?: string }> };
export type Deps = { root: string; env: Record<string, string | undefined>; fetchFn: typeof fetch; now: string; wait: (ms: number) => Promise<void> };

const readJson = <T>(path: string, fallback: T): T => (existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : fallback);

function filmsShowing(root: string, now: string): Film[] {
  const onDisk = join(root, "data/showtimes.json");
  if (existsSync(onDisk)) return (JSON.parse(readFileSync(onDisk, "utf8")) as { films: Film[] }).films;
  return (refreshFromFixtures({ now, root }).files.get("data/showtimes.json") as { films: Film[] }).films;
}

async function ask<T>(path: string, deps: Deps, token: string): Promise<T> {
  const response = await deps.fetchFn(`${API}${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
  if (!response.ok) throw new Error(`TMDB answered ${response.status} for ${path.split("?")[0]}`);
  await deps.wait(GAP_MS);
  return (await response.json()) as T;
}

/** Runs the command line; returns the exit code. */
export async function main(argv: string[], deps: Deps): Promise<number> {
  const { root, now } = deps;
  const dryRun = argv.includes("--dry-run");
  const films = filmsShowing(root, now);
  const overrides = readJson<{ films: Record<string, number | null> }>(join(root, "data/tmdb-overrides.json"), { films: {} }).films;
  const manual = readJson<{ films: Record<string, ManualEntry> }>(join(root, "data/credits-manual.json"), { films: {} }).films;
  const cachePath = join(root, "data/credits.json");
  const cache = readJson<CreditsFile | null>(cachePath, null)?.tmdb ?? {};
  const fresh = (filmId: string) => Object.hasOwn(cache, filmId) && Date.parse(now) - Date.parse((cache[filmId] as TmdbFilm).checkedAt) < WEEK_MS;
  const report = (tmdb: Record<string, TmdbFilm>) => console.log(`tmdb: ${answerShare(mergeCredits({ filmIds: films.map((film) => film.id), tmdb, manual })).text}`);

  const noMatch = films.filter((film) => Object.hasOwn(overrides, film.id) && overrides[film.id] === null);
  const toAsk = films.filter((film) => !noMatch.includes(film) && !fresh(film.id));
  console.log(`tmdb: ${films.length} films showing; ${films.length - toAsk.length - noMatch.length} answered in the last week, ${noMatch.length} marked "no match" by hand, ${toAsk.length} to look up.`);

  if (dryRun) {
    for (const film of toAsk) console.log(`tmdb: would look up "${film.title}"${typeof overrides[film.id] === "number" ? ` as TMDB ${overrides[film.id]} (by hand)` : ""}`);
    report(cache);
    console.log(`tmdb: dry run. Nothing was asked of TMDB and nothing was written. Token ${deps.env.TMDB_READ_TOKEN ? "is" : "is not"} set.`);
    return 0;
  }

  const token = deps.env.TMDB_READ_TOKEN;
  if (!token) {
    console.error("tmdb: TMDB_READ_TOKEN is not set. Put the free read token in .env.local (see .env.example). Nothing was asked or written.");
    return 1;
  }

  const tmdb: CreditsFile["tmdb"] = {};
  for (const film of films) if (fresh(film.id) && !noMatch.includes(film)) tmdb[film.id] = cache[film.id] as TmdbFilm;
  for (const film of toAsk) {
    const byHand = overrides[film.id];
    let tmdbId = typeof byHand === "number" ? byHand : null;
    if (tmdbId === null) {
      const found = await ask<{ results: TmdbResult[] }>(`/search/movie?query=${encodeURIComponent(film.title)}&include_adult=false`, deps, token);
      tmdbId = pickMatch(film.title, found.results ?? [], lagosDayKey(now));
    }
    if (tmdbId === null) {
      console.log(`tmdb: no sure match for "${film.title}"; it stays "not known yet"`);
      continue;
    }
    const details = await ask<{ title?: string; runtime?: number | null; keywords?: { keywords?: { id: number }[] } }>(`/movie/${tmdbId}?append_to_response=keywords`, deps, token);
    tmdb[film.id] = {
      tmdbId,
      tmdbTitle: details.title,
      runtimeMin: typeof details.runtime === "number" && details.runtime > 0 ? details.runtime : null,
      keywordIds: (details.keywords?.keywords ?? []).map((keyword) => keyword.id),
      checkedAt: now,
    };
    console.log(`tmdb: "${film.title}" is TMDB ${tmdbId} "${details.title ?? "?"}"${typeof byHand === "number" ? " (by hand)" : ""}`);
  }

  const file: CreditsFile = {
    schemaVersion: 1,
    about: "Written by scripts/tmdb.ts. TMDB ids, runtimes and keyword ids for the films showing, keyed by film id. Kept at most 6 months (D-31). This product uses the TMDB API but is not endorsed or certified by TMDB.",
    tmdb,
  };
  writeFileSync(cachePath, `${JSON.stringify(file, null, 2)}\n`);
  report(tmdb);
  console.log(`tmdb: wrote data/credits.json (${Object.keys(tmdb).length} of ${films.length} films matched). Check each match above by eye; fix a wrong one in data/tmdb-overrides.json.`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  if (existsSync(join(root, ".env.local"))) process.loadEnvFile(join(root, ".env.local"));
  const deps: Deps = {
    root,
    env: process.env,
    fetchFn: fetch,
    now: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  };
  process.exit(await main(process.argv.slice(2), deps));
}
