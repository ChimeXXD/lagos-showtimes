import { describe, expect, it } from "vitest";
import { freshness } from "@/lib/wording/freshness";

const FILMHOUSE = { name: "Filmhouse's site", method: "public-page" } as const;
const NOW = "2026-11-06T14:00:00Z"; // Fri 6 Nov, 15:00 in Lagos
/** A UTC time `seconds` before NOW. */
const ago = (seconds: number) => new Date(Date.parse(NOW) - seconds * 1000).toISOString().replace(".000Z", "Z");
const MIN = 60;
const HOUR = 3600;

describe("freshness wording: every band at both edges (DATA §Freshness, D-04)", () => {
  it.each([
    [0, "fresh", "Read from Filmhouse's site just now"],
    [59, "fresh", "Read from Filmhouse's site just now"],
    [1 * MIN, "fresh", "Read from Filmhouse's site 1 min ago"],
    [25 * MIN, "fresh", "Read from Filmhouse's site 25 min ago"],
    [59 * MIN + 59, "fresh", "Read from Filmhouse's site 59 min ago"],
    [1 * HOUR, "fresh", "Read from Filmhouse's site 1 hour ago"],
    [2 * HOUR, "fresh", "Read from Filmhouse's site 2 hours ago"],
    [5 * HOUR + 30 * MIN, "fresh", "Read from Filmhouse's site 5 hours ago"], // D-25: under 6 h is still "hours"
    [6 * HOUR - 1, "fresh", "Read from Filmhouse's site 5 hours ago"],
    [6 * HOUR, "today", "Read from Filmhouse's site today at 09:00"], // exactly 6 h
    [5 * HOUR + 50 * MIN + 6 * HOUR, "today", "Read from Filmhouse's site today at 03:10"],
  ] as const)("%i s old is %s: %s", (seconds, band, text) => {
    const f = freshness(FILMHOUSE, ago(seconds), NOW);
    expect(f).toEqual({ band, text, bookable: true });
  });

  it("uses the Lagos day for today, yesterday and older", () => {
    // 00:00 Lagos on Fri 6 Nov is 23:00 UTC on Thu 5 Nov.
    expect(freshness(FILMHOUSE, "2026-11-05T23:00:00Z", NOW)).toEqual({ band: "today", text: "Read from Filmhouse's site today at 00:00", bookable: true });
    expect(freshness(FILMHOUSE, "2026-11-05T22:59:59Z", NOW)).toEqual({
      band: "stale",
      text: "Read from Filmhouse's site yesterday at 23:59 · check with the cinema",
      bookable: true,
    });
    expect(freshness(FILMHOUSE, "2026-11-05T14:06:00Z", NOW).text).toBe("Read from Filmhouse's site yesterday at 15:06 · check with the cinema");
    // 00:00 Lagos on Thu 5 Nov is 23:00 UTC on Wed 4 Nov: the first second of "yesterday".
    expect(freshness(FILMHOUSE, "2026-11-04T23:00:00Z", NOW).band).toBe("stale");
    expect(freshness(FILMHOUSE, "2026-11-04T22:59:59Z", NOW)).toEqual({
      band: "old",
      text: "Last read from Filmhouse's site Wed 4 Nov · may have changed",
      bookable: false,
    });
    expect(freshness(FILMHOUSE, "2026-11-03T09:00:00Z", NOW).text).toBe("Last read from Filmhouse's site Tue 3 Nov · may have changed");
  });

  it("goes by age first: read 2 hours ago is fresh even across midnight", () => {
    // Now 01:00 Lagos on Sat; read at 23:00 Lagos on Fri.
    expect(freshness(FILMHOUSE, "2026-11-06T22:00:00Z", "2026-11-07T00:00:00Z")).toEqual({
      band: "fresh",
      text: "Read from Filmhouse's site 2 hours ago",
      bookable: true,
    });
  });

  it("treats a read time slightly in the future (clock drift) as just now", () => {
    expect(freshness(FILMHOUSE, "2026-11-06T14:00:20Z", NOW).text).toBe("Read from Filmhouse's site just now");
  });

  it("refuses times that are not UTC", () => {
    expect(() => freshness(FILMHOUSE, "2026-11-06T15:00:00", NOW)).toThrow(/UTC/);
  });
});

describe("data that reached us through another listing (via)", () => {
  const LAGOCINE = { name: "Lagocine", method: "permission-feed" } as const;
  const via = (fetchedAt: string) => ({ name: "EbonyLife's site", fetchedAt });

  it("names both, and takes the age from when the original site was read", () => {
    // Lagocine itself was read a minute ago; it read EbonyLife 2 hours ago.
    expect(freshness(LAGOCINE, ago(60), NOW, via(ago(2 * HOUR)))).toEqual({
      band: "fresh",
      text: "From Lagocine, which read EbonyLife's site 2 hours ago",
      bookable: true,
    });
  });

  it.each([
    [30, "From Lagocine, which read EbonyLife's site just now"],
    [25 * MIN, "From Lagocine, which read EbonyLife's site 25 min ago"],
    [7 * HOUR, "From Lagocine, which read EbonyLife's site today at 08:00"],
  ] as const)("%i s old reads %s", (seconds, text) => {
    expect(freshness(LAGOCINE, ago(0), NOW, via(ago(seconds))).text).toBe(text);
  });

  it("carries the stale and old warnings", () => {
    expect(freshness(LAGOCINE, ago(0), NOW, via("2026-11-05T14:06:00Z"))).toEqual({
      band: "stale",
      text: "From Lagocine, which read EbonyLife's site yesterday at 15:06 · check with the cinema",
      bookable: true,
    });
    expect(freshness(LAGOCINE, ago(0), NOW, via("2026-11-03T09:00:00Z"))).toEqual({
      band: "old",
      text: "From Lagocine, which last read EbonyLife's site Tue 3 Nov · may have changed",
      bookable: false,
    });
  });
});

describe("sample data (fixtures)", () => {
  const SAMPLE = { name: "Filmhouse's site", method: "fixture" } as const;

  it("says it is sample data and names the day it was saved, however old", () => {
    expect(freshness(SAMPLE, "2026-11-06T09:00:00Z", NOW)).toEqual({ band: "sample", text: "Sample data saved from Filmhouse's site on 6 Nov", bookable: false });
    expect(freshness(SAMPLE, "2026-11-06T09:00:00Z", "2026-12-25T09:00:00Z").text).toBe("Sample data saved from Filmhouse's site on 6 Nov");
  });

  it("is never bookable, even when just saved", () => {
    expect(freshness(SAMPLE, ago(5), NOW).bookable).toBe(false);
  });

  it("names the day in Lagos", () => {
    expect(freshness(SAMPLE, "2026-11-06T23:30:00Z", NOW).text).toBe("Sample data saved from Filmhouse's site on 7 Nov");
  });
});
