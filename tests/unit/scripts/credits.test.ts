import { describe, expect, it } from "vitest";
import { creditsWording } from "@/lib/wording/credits";
import { answerShare, creditsFromKeywords, manualCredits, mergeCredits, pickMatch, type TmdbFilm } from "../../../scripts/credits";

const TODAY = "2026-11-11";
const CHECKED = "2026-11-11T20:00:00Z";
const AFTER = 179430;
const DURING = 179431;

describe("pickMatch: which TMDB film a cinema's title means (D-25)", () => {
  const result = (id: number, title: string, release_date: string, original_title = title) => ({ id, title, original_title, release_date });

  it("takes the one current film with the same title", () => {
    expect(pickMatch("Whalefall", [result(1, "Whalefall", "2026-10-16"), result(2, "Whale Rider", "2003-01-30")], TODAY)).toBe(1);
  });

  it("matches however the title is written: case, accents, '&' and a format suffix", () => {
    expect(pickMatch("AGBARA NLA", [result(7, "Agbara Nla", "2026-11-06")], TODAY)).toBe(7);
    expect(pickMatch("Arnie & Barney", [result(8, "Arnie and Barney", "2026-10-30")], TODAY)).toBe(8);
    expect(pickMatch("Ramayana (IMAX)", [result(9, "Ramayana", "2026-11-06")], TODAY)).toBe(9);
  });

  it("matches on the original title too", () => {
    expect(pickMatch("Onibon Oje", [result(3, "The Hunter's Bag", "2026-09-01", "Onibon Oje")], TODAY)).toBe(3);
  });

  it("leaves a remake unmatched when only the old film is found", () => {
    expect(pickMatch("Street Fighter", [result(4, "Street Fighter", "1994-12-23")], TODAY)).toBeNull();
  });

  it("picks the current film over an old one with the same title", () => {
    expect(pickMatch("Street Fighter", [result(4, "Street Fighter", "1994-12-23"), result(5, "Street Fighter", "2026-10-16")], TODAY)).toBe(5);
  });

  it("stays unmatched when two current films share the title", () => {
    expect(pickMatch("Verity", [result(1, "Verity", "2026-10-02"), result(2, "Verity", "2026-05-15")], TODAY)).toBeNull();
  });

  it("stays unmatched for a near miss, a film with no release date, or no results", () => {
    expect(pickMatch("Agbara Nla: The Return", [result(7, "Agbara Nla", "2026-11-06")], TODAY)).toBeNull();
    expect(pickMatch("Clayface", [{ id: 6, title: "Clayface" }], TODAY)).toBeNull();
    expect(pickMatch("Clayface", [], TODAY)).toBeNull();
  });

  it("counts a film as current from 18 months back to 4 months ahead", () => {
    expect(pickMatch("X", [result(1, "X", "2025-05-11")], TODAY)).toBe(1);
    expect(pickMatch("X", [result(1, "X", "2025-05-10")], TODAY)).toBeNull();
    expect(pickMatch("X", [result(1, "X", "2027-03-11")], TODAY)).toBe(1);
    expect(pickMatch("X", [result(1, "X", "2027-03-12")], TODAY)).toBeNull();
  });
});

describe("creditsFromKeywords (D-10, D-19)", () => {
  it("says Stay, with TMDB as the source, for the after-credits keyword", () => {
    const credits = creditsFromKeywords(603, [12, AFTER], CHECKED);
    expect(credits).toEqual({
      during: "unknown", after: "yes", confidence: "confirmed", count: null,
      sources: [{ name: "TMDB", url: "https://www.themoviedb.org/movie/603", checkedAt: CHECKED }],
    });
    expect(creditsWording(credits).chip).toBe("Stay: scene after the credits · TMDB");
  });

  it("reads both keywords", () => {
    expect(creditsFromKeywords(603, [DURING, AFTER], CHECKED)).toMatchObject({ during: "yes", after: "yes", confidence: "confirmed" });
    expect(creditsFromKeywords(603, [DURING], CHECKED)).toMatchObject({ during: "yes", after: "unknown" });
  });

  it("never says Go: a film with neither keyword is not known yet, with no source", () => {
    const credits = creditsFromKeywords(603, [12, 99], CHECKED);
    expect(credits).toEqual({ during: "unknown", after: "unknown", confidence: "unknown", sources: [], count: null });
    expect(creditsWording(credits).chip).toBe("Credits scene: not known yet");
  });
});

describe("manualCredits: Chime's own entries (D-19)", () => {
  const source = { name: "RunPee", url: "https://runpee.com/whalefall", checkedAt: "2026-11-10T09:00:00Z" };

  it("is the only way Go appears", () => {
    const credits = manualCredits("whalefall", { during: "no", after: "no", source });
    expect(creditsWording(credits)).toMatchObject({ chip: "Go: nothing after the credits", detail: "Per RunPee, checked 10 Nov." });
  });

  it.each([
    ["no link", { ...source, url: "" }, "needs an https link"],
    ["a link that is not https", { ...source, url: "http://runpee.com/x" }, "needs an https link"],
    ["no name", { ...source, name: " " }, "needs a source name"],
    ["a checked date that is not UTC", { ...source, checkedAt: "10 Nov" }, "needs a checkedAt like 2026-11-10T09:00:00Z"],
  ])("refuses an entry with %s", (_, bad, message) => {
    expect(() => manualCredits("whalefall", { during: "no", after: "no", source: bad })).toThrow(`data/credits-manual.json, whalefall: ${message}`);
  });

  it("refuses an answer that is not yes or no", () => {
    expect(() => manualCredits("whalefall", { during: "maybe", after: "no", source } as never)).toThrow(
      'data/credits-manual.json, whalefall: during must be "yes" or "no"',
    );
  });
});

describe("mergeCredits", () => {
  const tmdb: Record<string, TmdbFilm> = {
    whalefall: { tmdbId: 11, runtimeMin: 107, keywordIds: [AFTER], checkedAt: CHECKED },
    clayface: { tmdbId: 12, runtimeMin: null, keywordIds: [], checkedAt: CHECKED },
  };
  const manual = { clayface: { during: "no", after: "no", source: { name: "Chime", url: "https://example.com/clayface", checkedAt: CHECKED } } } as const;
  const merged = mergeCredits({ filmIds: ["whalefall", "clayface", "one-gidi-night"], tmdb, manual });

  it("gives every film an entry, matched or not", () => {
    expect(Object.keys(merged)).toEqual(["whalefall", "clayface", "one-gidi-night"]);
    expect(merged["one-gidi-night"]).toEqual({
      tmdbId: null, runtimeMin: null, posterPath: null,
      credits: { during: "unknown", after: "unknown", confidence: "unknown", sources: [], count: null },
    });
  });

  it("carries TMDB's poster path, and null when there is none", () => {
    const withPoster = mergeCredits({ filmIds: ["whalefall", "clayface", "x"], tmdb: { ...tmdb, whalefall: { ...tmdb.whalefall!, posterPath: "/abc.jpg" } }, manual: {} });
    expect(withPoster.whalefall?.posterPath).toBe("/abc.jpg");
    expect(withPoster.clayface?.posterPath).toBeNull();
    expect(withPoster.x?.posterPath).toBeNull();
  });

  it("takes the id, runtime and keyword answer from TMDB", () => {
    expect(merged.whalefall).toMatchObject({ tmdbId: 11, runtimeMin: 107, credits: { after: "yes", confidence: "confirmed" } });
  });

  it("lets a manual entry win over TMDB, keeping the TMDB id and runtime", () => {
    expect(merged.clayface).toMatchObject({ tmdbId: 12, credits: { during: "no", after: "no", sources: [{ name: "Chime" }] } });
  });

  it("ignores a manual entry for a film that is not showing", () => {
    const withExtra = mergeCredits({ filmIds: ["whalefall"], tmdb, manual });
    expect(Object.keys(withExtra)).toEqual(["whalefall"]);
  });

  it("reports the share of films with an answer", () => {
    expect(answerShare(merged)).toEqual({ answered: 2, total: 3, text: "2 of 3 films have a credits answer (67%)" });
    expect(answerShare({}).text).toBe("0 of 0 films have a credits answer");
  });
});
