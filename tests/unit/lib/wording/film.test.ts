import { describe, expect, it } from "vitest";
import { filmMeta, shortCountdown } from "@/lib/wording/film";

describe("filmMeta", () => {
  it.each([
    [{ runtimeMin: 145, rating: "12A" }, "2 h 25 min · 12A"],
    [{ runtimeMin: 120, rating: null }, "2 h 0 min"],
    [{ runtimeMin: 45, rating: "PG" }, "45 min · PG"], // under an hour: never "0 h 45 min"
    [{ runtimeMin: null, rating: "18" }, "18"],
    [{ runtimeMin: null, rating: null }, "Runtime not listed"],
  ])("%j -> %s", (film, text) => {
    expect(filmMeta(film)).toBe(text);
  });
});

describe("shortCountdown rounds down, so it never promises more time than there is", () => {
  it.each([
    ["2026-11-06T17:00:59Z", "now"], // the last minute: never "in 0 min"
    ["2026-11-06T17:01:00Z", "in 1 min"],
    ["2026-11-06T17:15:30Z", "in 15 min"],
    ["2026-11-06T18:00:00Z", "in 1 h"],
    ["2026-11-06T18:35:59Z", "in 1 h 35 min"],
  ])("%s -> %s", (at, text) => {
    expect(shortCountdown(at, "2026-11-06T17:00:00Z")).toBe(text);
  });
});
