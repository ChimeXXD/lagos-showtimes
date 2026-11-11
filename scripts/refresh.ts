// Refresh showtimes: read sources -> normalise -> validate -> write data/showtimes.json and the
// per-area files (SPEC §4, DATA §Per-area files).
//
//   node scripts/refresh.ts --fixtures [--now 2026-11-20T18:00:00Z]
//
// Only --fixtures is built: it turns the saved pages in tests/fixtures/ into sample data on
// today's and tomorrow's dates (D-20). Reading a live site waits for a cleared source (D-08, D-33).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import type { Cinema, ShowtimesFile, Source } from "../src/lib/data/types.ts";
import { lagosDayKey } from "../src/lib/time/lagos.ts";
import { mergeCredits, type ManualEntry, type TmdbFilm } from "./credits.ts";
import { buildShowtimes, splitByArea, toSampleDays, type Batch } from "./pipeline.ts";
import { parseLagocineCinema, parseLagocineDay } from "./sources/lagocine.ts";
import type { ParsedPage } from "./sources/raw.ts";

/**
 * The most one public data file may weigh, gzipped. A page's HTML, CSS, JS, font and data share
 * 200 KB (D-28), and the empty app already takes 162, so data gets what is left after the page's
 * own markup. All of Lagos for two days (588 sample showings, no booking links) measured 10.3 KB on
 * 11 Nov 2026 (D-45); live rows carry booking links and will weigh more.
 */
export const DATA_FILE_LIMIT_KB = 20;

type FixtureEntry = { file: string; sourceId: string; page: string; cinemaId?: string; savedAt: string; sample: boolean };
type RegistryCinema = Omit<Cinema, "sourceIds"> & Record<string, unknown>;
type RegistrySource = { id: string; name: string; homepage: string; status: Source["status"]; cinemaIds: string[] };

const readJson = <T>(path: string) => JSON.parse(readFileSync(path, "utf8")) as T;

function parseFixture(entry: FixtureEntry, html: string): ParsedPage {
  if (entry.page === "lagocine-day") return parseLagocineDay(html);
  if (entry.page === "lagocine-cinema" && entry.cinemaId) return parseLagocineCinema(html, entry.cinemaId);
  throw new Error(`No sample-data parser for the fixture ${entry.file} (page "${entry.page}")`);
}

/** Sample data from the saved fixtures, as the files to write (path under the repo root -> file). */
export function refreshFromFixtures(options: { now: string; root: string }): { files: Map<string, ShowtimesFile>; log: string[] } {
  const { now, root } = options;
  const registry = readJson<{ areas: { slug: string }[]; cinemas: RegistryCinema[] }>(join(root, "data/cinemas.json"));
  const sourceRegistry = readJson<{ sources: RegistrySource[] }>(join(root, "data/sources.json")).sources;
  const entries = readJson<{ fixtures: FixtureEntry[] }>(join(root, "tests/fixtures/index.json")).fixtures.filter((entry) => entry.sample);

  // One batch per source: its pages were saved in one sitting, and a cinema's tomorrow may be on
  // a different page from its today.
  const batches: Batch[] = [];
  for (const sourceId of new Set(entries.map((entry) => entry.sourceId))) {
    const pages = entries.filter((entry) => entry.sourceId === sourceId);
    const parsed = pages.map((entry) => parseFixture(entry, readFileSync(join(root, "tests/fixtures", entry.file), "utf8")));
    const savedAt = pages.map((entry) => entry.savedAt).sort().at(-1) as string;
    batches.push({
      sourceId,
      fetchedAt: savedAt,
      builtAt: parsed.map((page) => page.builtAt).find((stamp) => stamp !== null) ?? null,
      through: sourceId === "lagocine",
      showings: toSampleDays(parsed.flatMap((page) => page.showings), lagosDayKey(savedAt), now),
    });
  }

  const sources: Source[] = batches.map((batch) => {
    const entry = sourceRegistry.find((source) => source.id === batch.sourceId);
    if (!entry) throw new Error(`The fixture source "${batch.sourceId}" is not in data/sources.json`);
    return { id: entry.id, name: entry.name, url: entry.homepage, method: "fixture", status: entry.status, fetchedAt: batch.fetchedAt, lastOkAt: batch.fetchedAt, health: "ok" };
  });
  const cinemas: Cinema[] = registry.cinemas.map((cinema) => ({
    id: cinema.id, name: cinema.name, chain: cinema.chain, area: cinema.area, address: cinema.address ?? null, geo: cinema.geo ?? null,
    website: cinema.website ?? null, bookingHost: cinema.bookingHost ?? null,
    sourceIds: sources.filter((source) => sourceRegistry.find((entry) => entry.id === source.id)?.cinemaIds.includes(cinema.id)).map((source) => source.id),
  }));

  // Credits: what scripts/tmdb.ts last wrote (if it has run) with Chime's own entries on top (D-19).
  const creditsPath = join(root, "data/credits.json");
  const tmdb = existsSync(creditsPath) ? readJson<{ tmdb: Record<string, TmdbFilm> }>(creditsPath).tmdb : {};
  const manual = readJson<{ films: Record<string, ManualEntry> }>(join(root, "data/credits-manual.json")).films;
  const creditsFor = (filmId: string) => mergeCredits({ filmIds: [filmId], tmdb, manual })[filmId];

  const { file, log } = buildShowtimes({ generatedAt: now, sources, cinemas, batches, creditsFor });
  const files = new Map<string, ShowtimesFile>([["data/showtimes.json", file]]);
  for (const [slug, part] of splitByArea(file, registry.areas.map((area) => area.slug), now)) {
    files.set(slug === "all" ? "public/data/all.json" : `public/data/area/${slug}.json`, part);
  }
  return { files, log };
}

const UTC_SECONDS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const gzipKb = (text: string) => gzipSync(text, { level: 9 }).length / 1024;
/** data/showtimes.json is kept readable for diffs; the files a page loads are compact. */
const serialise = (path: string, file: ShowtimesFile) => (path.startsWith("public/") ? JSON.stringify(file) : `${JSON.stringify(file, null, 2)}\n`);
const withoutStamp = (file: ShowtimesFile) => JSON.stringify({ ...file, generatedAt: null });

/** Writes each file under `root`, skipping one whose content is the same apart from generatedAt. */
export function writeFiles(files: Map<string, ShowtimesFile>, root: string): { written: string[]; unchanged: number } {
  const written: string[] = [];
  for (const [path, file] of files) {
    const target = join(root, path);
    if (existsSync(target)) {
      let same = false;
      try {
        same = withoutStamp(readJson<ShowtimesFile>(target)) === withoutStamp(file);
      } catch {
        // An unreadable file on disk is simply replaced.
      }
      if (same) continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, serialise(path, file));
    written.push(path);
  }
  return { written, unchanged: files.size - written.length };
}

/** Runs the command line; returns the exit code. */
export function main(argv: string[]): number {
  if (!argv.includes("--fixtures")) {
    console.error("refresh: only --fixtures is built. Reading a live site waits for a cleared source (D-08, D-33). Nothing was read or written.");
    return 1;
  }
  const nowFlag = argv.indexOf("--now");
  const now = nowFlag >= 0 ? (argv[nowFlag + 1] ?? "") : new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  if (!UTC_SECONDS.test(now) || Number.isNaN(Date.parse(now))) {
    console.error(`refresh: --now needs a UTC time like 2026-11-20T18:00:00Z, got "${now}". Nothing was read or written.`);
    return 1;
  }
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");

  const { files, log } = refreshFromFixtures({ now, root });
  for (const line of log) console.log(`refresh: ${line}`);

  let overBudget = false;
  for (const [path, file] of files) {
    const size = gzipKb(serialise(path, file));
    const isPublic = path.startsWith("public/");
    if (isPublic && size > DATA_FILE_LIMIT_KB) overBudget = true;
    console.log(`refresh: ${path}: ${file.showings.length} showings, ${file.films.length} films, ${size.toFixed(1)} KB gzipped${isPublic && size > DATA_FILE_LIMIT_KB ? ` (over the ${DATA_FILE_LIMIT_KB} KB limit)` : ""}`);
  }
  if (overBudget) {
    console.error("refresh: a data file is over the budget (D-21). Nothing was written.");
    return 1;
  }
  const { written, unchanged } = writeFiles(files, root);
  console.log(`refresh: sample data for ${lagosDayKey(now)} and the day after (Lagos). Wrote ${written.length} files, ${unchanged} unchanged.`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
