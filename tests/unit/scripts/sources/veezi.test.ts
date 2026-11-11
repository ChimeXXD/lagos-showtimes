import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseVeeziSessions } from "../../../../scripts/sources/veezi";

// Silverbird Ikeja's Veezi listing, saved on 11 Nov 2026 and cut down (D-24). Its dates have no
// year ("Wednesday 11, November") and its times are on a 12-hour clock ("6:35 PM").
const html = readFileSync(join(import.meta.dirname, "../../../fixtures/silverbird/2026-11-11-ikeja.html"), "utf8");
const readOn = { year: 2026, month: 11, day: 11 };
const parse = (page = html, on = readOn) => parseVeeziSessions(page, { cinemaId: "silverbird-ikeja", readOn: on });

describe("parseVeeziSessions", () => {
  const page = parse();

  it("reads all 70 sessions: 28 on each of 11 and 12 Nov, then the December dates", () => {
    expect(page.showings).toHaveLength(70);
    const days: Record<string, number> = {};
    for (const s of page.showings) days[s.startsAt.slice(0, 10)] = (days[s.startsAt.slice(0, 10)] ?? 0) + 1;
    expect(days).toEqual({
      "2026-11-11": 28, "2026-11-12": 28, "2026-12-04": 2, "2026-12-05": 2, "2026-12-06": 2,
      "2026-12-07": 2, "2026-12-08": 2, "2026-12-09": 2, "2026-12-10": 2,
    });
    expect(new Set(page.showings.map((s) => s.filmTitle)).size).toBe(17);
  });

  it("turns a 12-hour Lagos time into UTC: 10:40 AM is 09:40Z", () => {
    expect(page.showings[0]).toEqual({
      cinemaId: "silverbird-ikeja",
      filmTitle: "Arnie & Barney",
      rating: "PG",
      startsAt: "2026-11-11T09:40:00Z",
      format: null,
      bookingUrl: "https://ticketing.eu.veezi.com/purchase/321781?siteToken=9chn7w68550a7sxgexpdng2ndm",
    });
    expect(page.showings[1]?.startsAt).toBe("2026-11-11T11:30:00Z"); // 12:30 PM
    const lovingItohan = page.showings.filter((s) => s.filmTitle === "Loving Itohan" && s.startsAt.startsWith("2026-11-11"));
    expect(lovingItohan.map((s) => s.startsAt)).toEqual(["2026-11-11T10:00:00Z", "2026-11-11T15:15:00Z", "2026-11-11T19:50:00Z"]);
  });

  it("gives the same start times as Lagocine's page for the same cinema", () => {
    const lagocine = readFileSync(join(import.meta.dirname, "../../../fixtures/lagocine/2026-11-11-cinema-silverbird-ikeja.html"), "utf8");
    const theirs = [...lagocine.matchAll(/data-showtime="true" data-starts-at="([^"]+)"/g)].map((m) => new Date(m[1] as string).toISOString().replace(".000Z", "Z"));
    expect(page.showings.map((s) => s.startsAt).sort()).toEqual(theirs.sort());
  });

  it("reads an empty or TBC rating as no rating", () => {
    expect(page.showings.find((s) => s.filmTitle === "The Cleaner")?.rating).toBeNull();
    expect(page.showings.find((s) => s.filmTitle === "The Cat in the Hat")?.rating).toBeNull();
  });

  it("puts a date earlier in the year than the day it was read into next year", () => {
    const january = html.replaceAll("Friday 4, December", "Monday 4, January");
    const starts = parse(january).showings.map((s) => s.startsAt.slice(0, 10));
    expect(starts).toContain("2027-01-04");
    expect(starts).not.toContain("2026-01-04");
  });

  it("refuses a date whose weekday does not match, rather than guessing the year", () => {
    expect(() => parse(html.replaceAll("Wednesday 11, November", "Friday 11, November"))).toThrow(
      'Veezi page: "Friday 11, November" is not a Friday in 2026',
    );
  });

  it("handles noon and midnight on the 12-hour clock", () => {
    const edge = html.replace("<time>10:40 AM</time>", "<time>12:05 AM</time>").replace("<time>12:30 PM</time>", "<time>12:00 PM</time>");
    const starts = parse(edge).showings.slice(0, 2).map((s) => s.startsAt);
    expect(starts).toEqual(["2026-11-10T23:05:00Z", "2026-11-11T11:00:00Z"]);
  });

  it("fails loudly on a time it cannot read or a page with no sessions", () => {
    expect(() => parse(html.replace("<time>10:40 AM</time>", "<time>10.40</time>"))).toThrow('Veezi page: cannot read the time "10.40"');
    expect(() => parse("<html></html>")).toThrow("Veezi page: no films found. Has the page layout changed?");
  });
});
