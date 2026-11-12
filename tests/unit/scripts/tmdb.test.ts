import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { main, type CreditsFile, type Deps } from "../../../scripts/tmdb";

const NOW = "2026-11-11T20:00:00Z";
const films = [
  { id: "whalefall", title: "Whalefall" },
  { id: "street-fighter", title: "Street Fighter" },
  { id: "one-gidi-night", title: "One Gidi Night" },
  { id: "clayface", title: "Clayface" },
];

/** A scratch project holding only what the script reads. */
function project(extra: Record<string, unknown> = {}): string {
  const root = mkdtempSync(join(tmpdir(), "sinima-tmdb-"));
  mkdirSync(join(root, "data"));
  const files: Record<string, unknown> = { "data/showtimes.json": { films }, "data/tmdb-overrides.json": { films: {} }, "data/credits-manual.json": { films: {} }, ...extra };
  for (const [path, content] of Object.entries(files)) writeFileSync(join(root, path), JSON.stringify(content));
  return root;
}
const noNetwork = vi.fn(() => Promise.reject(new Error("the network was used")));
const deps = (root: string, over: Partial<Deps> = {}): Deps => ({ root, env: {}, fetchFn: noNetwork as unknown as typeof fetch, now: NOW, wait: () => Promise.resolve(), ...over });

// TMDB's v3 shapes, cut down. The real script ran against the live API with these paths on 11 Nov 2026.
const answers: Record<string, unknown> = {
  "/search/movie?query=Whalefall&include_adult=false": { results: [{ id: 11, title: "Whalefall", original_title: "Whalefall", release_date: "2026-10-16" }] },
  "/search/movie?query=Street%20Fighter&include_adult=false": { results: [{ id: 4, title: "Street Fighter", release_date: "1994-12-23" }] },
  "/search/movie?query=One%20Gidi%20Night&include_adult=false": { results: [] },
  "/search/movie?query=Clayface&include_adult=false": { results: [] },
  "/movie/11?append_to_response=keywords": { title: "Whalefall", runtime: 107, poster_path: "/whale.jpg", keywords: { keywords: [{ id: 179430, name: "aftercreditsstinger" }, { id: 12, name: "sea" }] } },
  "/movie/77?append_to_response=keywords": { title: "Clayface", runtime: 0, keywords: { keywords: [] } },
};
const fakeTmdb = vi.fn((url: string, init?: RequestInit) => {
  const path = url.replace("https://api.themoviedb.org/3", "");
  if ((init?.headers as Record<string, string>).Authorization !== "Bearer secret-token") return Promise.resolve(new Response("{}", { status: 401 }));
  return Promise.resolve(Object.hasOwn(answers, path) ? Response.json(answers[path]) : new Response("{}", { status: 404 }));
});

describe("scripts/tmdb.ts", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const printed = () => [...log.mock.calls, ...error.mock.calls].map((call) => String(call[0])).join("\n");
  afterEach(() => vi.clearAllMocks());

  it("--dry-run lists what it would look up and the share answered, without the network or a token", async () => {
    expect(await main(["--dry-run"], deps(project()))).toBe(0);
    expect(noNetwork).not.toHaveBeenCalled();
    expect(printed()).toContain('would look up "Whalefall"');
    expect(printed()).toContain("0 of 4 films have a credits answer (0%)");
    expect(printed()).toContain("Token is not set.");
  });

  it("stops with an error when there is no token, without the network", async () => {
    expect(await main([], deps(project()))).toBe(1);
    expect(noNetwork).not.toHaveBeenCalled();
    expect(printed()).toContain("TMDB_READ_TOKEN is not set");
  });

  it("matches, reads keywords and runtime, and writes data/credits.json", async () => {
    const root = project({ "data/tmdb-overrides.json": { films: { clayface: 77 } } });
    expect(await main([], deps(root, { env: { TMDB_READ_TOKEN: "secret-token" }, fetchFn: fakeTmdb as unknown as typeof fetch }))).toBe(0);
    const written = JSON.parse(readFileSync(join(root, "data/credits.json"), "utf8")) as CreditsFile;
    expect(written.tmdb).toEqual({
      whalefall: { tmdbId: 11, tmdbTitle: "Whalefall", runtimeMin: 107, posterPath: "/whale.jpg", keywordIds: [179430, 12], checkedAt: NOW },
      // Matched by hand in tmdb-overrides.json, so it is not searched for. A runtime of 0 is unknown.
      clayface: { tmdbId: 77, tmdbTitle: "Clayface", runtimeMin: null, posterPath: null, keywordIds: [], checkedAt: NOW },
    });
    expect(printed()).toContain('no sure match for "Street Fighter"'); // only the 1994 film was found
    expect(printed()).toContain('no sure match for "One Gidi Night"');
    expect(printed()).toContain("1 of 4 films have a credits answer (25%)");
  });

  it("never prints or writes the token", async () => {
    const root = project();
    await main([], deps(root, { env: { TMDB_READ_TOKEN: "secret-token" }, fetchFn: fakeTmdb as unknown as typeof fetch }));
    expect(printed()).not.toContain("secret-token");
    expect(readFileSync(join(root, "data/credits.json"), "utf8")).not.toContain("secret-token");
  });

  it("does not ask again about a film answered in the last week, or one marked no match by hand", async () => {
    const cached = { schemaVersion: 1, about: "", tmdb: { whalefall: { tmdbId: 11, runtimeMin: 107, posterPath: "/whale.jpg", keywordIds: [179430], checkedAt: "2026-11-08T20:00:00Z" } } };
    const root = project({ "data/credits.json": cached, "data/tmdb-overrides.json": { films: { "street-fighter": null, "one-gidi-night": null, clayface: null } } });
    expect(await main([], deps(root, { env: { TMDB_READ_TOKEN: "secret-token" }, fetchFn: fakeTmdb as unknown as typeof fetch }))).toBe(0);
    expect(fakeTmdb).not.toHaveBeenCalled();
    expect((JSON.parse(readFileSync(join(root, "data/credits.json"), "utf8")) as CreditsFile).tmdb.whalefall?.checkedAt).toBe("2026-11-08T20:00:00Z");
  });

  it("sends TMDB's short API key in the address instead of the header, and never prints it", async () => {
    const key = "0123456789abcdef0123456789abcdef";
    const seen: string[] = [];
    const byKey = vi.fn((url: string, init?: RequestInit) => {
      seen.push(url);
      expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
      const path = url.replace("https://api.themoviedb.org/3", "").replace(/[?&]api_key=[0-9a-f]{32}$/, "");
      return Promise.resolve(Object.hasOwn(answers, path) ? Response.json(answers[path]) : new Response("{}", { status: 404 }));
    });
    // The line break is what a pasted secret often carries; the key is still recognised.
    expect(await main([], deps(project(), { env: { TMDB_READ_TOKEN: `${key}\n` }, fetchFn: byKey as unknown as typeof fetch }))).toBe(0);
    expect(seen[0]).toBe(`https://api.themoviedb.org/3/search/movie?query=Whalefall&include_adult=false&api_key=${key}`);
    expect(seen).toContain(`https://api.themoviedb.org/3/movie/11?append_to_response=keywords&api_key=${key}`);
    expect(printed()).not.toContain(key);
  });

  it("asks again about a film whose saved answer has no poster field yet", async () => {
    const cached = { schemaVersion: 1, about: "", tmdb: { whalefall: { tmdbId: 11, runtimeMin: 107, keywordIds: [179430], checkedAt: "2026-11-10T20:00:00Z" } } };
    const root = project({ "data/credits.json": cached, "data/tmdb-overrides.json": { films: { whalefall: 11, "street-fighter": null, "one-gidi-night": null, clayface: null } } });
    expect(await main([], deps(root, { env: { TMDB_READ_TOKEN: "secret-token" }, fetchFn: fakeTmdb as unknown as typeof fetch }))).toBe(0);
    expect((JSON.parse(readFileSync(join(root, "data/credits.json"), "utf8")) as CreditsFile).tmdb.whalefall?.posterPath).toBe("/whale.jpg");
  });

  it("stops when TMDB refuses the token", async () => {
    await expect(main([], deps(project(), { env: { TMDB_READ_TOKEN: "wrong" }, fetchFn: fakeTmdb as unknown as typeof fetch }))).rejects.toThrow("TMDB answered 401 for /search/movie");
  });
});
