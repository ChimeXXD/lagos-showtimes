import { describe, expect, it } from "vitest";
import type { CreditsInfo } from "@/lib/data/types";
import { creditsWording } from "@/lib/wording/credits";

const TMDB = { name: "TMDB", url: "https://www.themoviedb.org/movie/1", checkedAt: "2026-11-05T10:00:00Z" };
const MANUAL = { name: "aftercredits.com", url: "https://aftercredits.com/a-film", checkedAt: "2026-11-05T10:00:00Z" };
const info = (over: Partial<CreditsInfo>): CreditsInfo => ({ during: "unknown", after: "unknown", confidence: "unknown", sources: [], count: null, ...over });

describe("credits wording: every row of DATA §Credits wording (D-10, D-19)", () => {
  it("one named source that says there is a scene gives Stay, with the source named", () => {
    expect(creditsWording(info({ after: "yes", confidence: "confirmed", sources: [TMDB] }))).toEqual({
      verdict: "stay",
      chip: "Stay: scene after the credits · TMDB",
      detail: "TMDB lists an after-credits scene.",
    });
  });

  it("names every source", () => {
    const w = creditsWording(info({ after: "yes", confidence: "confirmed", sources: [TMDB, MANUAL] }));
    expect(w.chip).toBe("Stay: scene after the credits · TMDB, aftercredits.com");
    expect(w.detail).toBe("TMDB and aftercredits.com list an after-credits scene.");
  });

  it("an inferred answer is only Probably stay", () => {
    expect(creditsWording(info({ after: "yes", confidence: "likely" }))).toEqual({
      verdict: "probably-stay",
      chip: "Probably stay: scene after the credits",
      detail: "A guess: no source has confirmed it yet.",
    });
  });

  it("a scene during the credits only", () => {
    expect(creditsWording(info({ during: "yes", after: "no", confidence: "confirmed", sources: [TMDB] }))).toEqual({
      verdict: "stay",
      chip: "Stay a little: scene during the credits",
      detail: "TMDB lists a scene during the credits.",
    });
    expect(creditsWording(info({ during: "yes", confidence: "confirmed", sources: [TMDB] })).chip).toBe("Stay a little: scene during the credits");
  });

  it("scenes during and after", () => {
    expect(creditsWording(info({ during: "yes", after: "yes", confidence: "confirmed", sources: [TMDB] }))).toEqual({
      verdict: "stay",
      chip: "Stay: scenes during and after the credits",
      detail: "TMDB lists scenes during and after the credits.",
    });
  });

  it("Go needs a source with a link that says so", () => {
    expect(creditsWording(info({ during: "no", after: "no", confidence: "confirmed", sources: [MANUAL] }))).toEqual({
      verdict: "go",
      chip: "Go: nothing after the credits",
      detail: "Per aftercredits.com, checked 5 Nov.",
    });
  });
});

describe("credits wording never says Go without a source", () => {
  const NOT_KNOWN = { verdict: "unknown", chip: "Credits scene: not known yet", detail: "No source has told us yet." };

  it("a missing keyword is not known yet, never Go", () => {
    expect(creditsWording(info({}))).toEqual(NOT_KNOWN);
  });

  it.each([
    ["no sources at all", info({ during: "no", after: "no", confidence: "confirmed" })],
    ["a source without a link", info({ during: "no", after: "no", confidence: "confirmed", sources: [{ ...MANUAL, url: "" }] })],
    ["a link that is not https", info({ during: "no", after: "no", confidence: "confirmed", sources: [{ ...MANUAL, url: "http://aftercredits.com/a-film" }] })],
    ["a source with no checked date", info({ during: "no", after: "no", confidence: "confirmed", sources: [{ ...MANUAL, checkedAt: "" }] })],
    ["a checked date that is not a UTC time", info({ during: "no", after: "no", confidence: "confirmed", sources: [{ ...MANUAL, checkedAt: "5 Nov" }] })],
    ["only a guess", info({ during: "no", after: "no", confidence: "likely", sources: [MANUAL] })],
    ["after no but during unknown", info({ after: "no", confidence: "confirmed", sources: [MANUAL] })],
    ["during no but after unknown", info({ during: "no", confidence: "confirmed", sources: [MANUAL] })],
  ])("no Go with %s", (_, credits) => {
    expect(creditsWording(credits)).toEqual(NOT_KNOWN);
  });

  it("does not say Stay on a 'confirmed' answer that names no source", () => {
    expect(creditsWording(info({ after: "yes", confidence: "confirmed" }))).toEqual(NOT_KNOWN);
    expect(creditsWording(info({ during: "yes", confidence: "confirmed" }))).toEqual(NOT_KNOWN);
  });

  it("a guess about a scene during the credits is not known yet", () => {
    expect(creditsWording(info({ during: "yes", confidence: "likely" }))).toEqual(NOT_KNOWN);
  });

  it("no input produces the word Go unless the verdict is go", () => {
    const answers = ["yes", "no", "unknown"] as const;
    const confidences = ["confirmed", "likely", "unknown"] as const;
    for (const during of answers) for (const after of answers) for (const confidence of confidences) for (const sources of [[], [TMDB]]) {
      const w = creditsWording(info({ during, after, confidence, sources }));
      if (w.verdict !== "go") expect(w.chip.startsWith("Go")).toBe(false);
      else expect([during, after, confidence, sources.length]).toEqual(["no", "no", "confirmed", 1]);
    }
  });
});
