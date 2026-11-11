import { describe, expect, it } from "vitest";
import { buildIcs, icsFileName, type IcsShowing } from "@/lib/ics/ics";

const NOW = "2026-11-06T14:00:00Z";
const showing: IcsShowing = {
  id: "filmhouse-lekki-imax_sinners_2026-11-06T18:30:00Z",
  film: "Sinners",
  cinema: "Filmhouse Lekki IMAX",
  address: "The Rock Drive, off Bisola Durosinmi Etti Drive, Lekki Phase 1, Lagos",
  startsAt: "2026-11-06T18:30:00Z", // 19:30 in Lagos
  runtimeMin: 137,
  bookingUrl: "https://www.filmhouseng.com/",
  sourceLine: "Read from Filmhouse's site 2 hours ago",
};

/** Minimal RFC 5545 reader: unfold lines, then split each into name, parameters and value. */
function parse(ics: string) {
  const lines = ics.replace(/\r\n[ \t]/g, "").split("\r\n");
  return lines.filter(Boolean).map((line) => {
    const colon = line.indexOf(":");
    return { name: line.slice(0, colon).split(";")[0]!, value: line.slice(colon + 1) };
  });
}
const value = (ics: string, name: string) => parse(ics).find((l) => l.name === name)?.value;
const unescape = (v: string) => v.replace(/\\n/g, "\n").replace(/\\([,;\\])/g, "$1");

describe("buildIcs: the Remind me calendar file (SPEC §6, acceptance 5)", () => {
  const ics = buildIcs(showing, NOW);

  it("starts in UTC with a Z: a 19:30 Lagos show is 18:30Z", () => {
    expect(ics).toContain("\r\nDTSTART:20261106T183000Z\r\n");
    expect(ics).not.toMatch(/TZID/);
  });

  it("has one alarm 30 minutes before", () => {
    const names = parse(ics).map((l) => `${l.name}:${l.value}`);
    const alarm = names.slice(names.indexOf("BEGIN:VALARM"), names.indexOf("END:VALARM") + 1);
    expect(alarm).toEqual(["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Sinners starts in 30 min at Filmhouse Lekki IMAX", "TRIGGER:-PT30M", "END:VALARM"]);
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(1);
  });

  it("has a UID that is stable for the showing, and a DTSTAMP", () => {
    expect(value(ics, "UID")).toBe("filmhouse-lekki-imax_sinners_2026-11-06T18:30:00Z@sinima");
    expect(value(buildIcs(showing, "2026-11-06T15:00:00Z"), "UID")).toBe(value(ics, "UID"));
    expect(value(ics, "DTSTAMP")).toBe("20261106T140000Z");
  });

  it("uses CRLF line endings throughout and ends with one", () => {
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it("folds every line at 75 bytes and the text survives unfolding", () => {
    const long = buildIcs({ ...showing, film: "The Secret Lives of Baba Segi's Wives: The Director's Extended Anniversary Cut" }, NOW);
    for (const line of long.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(long).toMatch(/\r\n /); // something was folded
    expect(unescape(value(long, "SUMMARY")!)).toBe("The Secret Lives of Baba Segi's Wives: The Director's Extended Anniversary Cut at Filmhouse Lekki IMAX");
  });

  it("never splits a multi-byte character when folding", () => {
    const film = "Ọmọ Ìbàdàn ".repeat(12).trim();
    const out = buildIcs({ ...showing, film }, NOW);
    for (const line of out.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(out).not.toContain("\uFFFD");
    expect(unescape(value(out, "SUMMARY")!)).toBe(`${film} at Filmhouse Lekki IMAX`);
  });

  it("wraps the event in a calendar a phone will accept", () => {
    const names = parse(ics).map((l) => `${l.name}:${l.value}`);
    expect(names.slice(0, 4)).toEqual(["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sinima//Showtimes//EN", "CALSCALE:GREGORIAN"]);
    expect(names.at(-1)).toBe("END:VCALENDAR");
    expect(names.filter((n) => n === "BEGIN:VEVENT")).toHaveLength(1);
  });

  it("lasts the film's runtime, or 2 hours when it is not known", () => {
    expect(value(ics, "DURATION")).toBe("PT137M");
    expect(value(buildIcs({ ...showing, runtimeMin: null }, NOW), "DURATION")).toBe("PT2H");
    expect(value(buildIcs({ ...showing, runtimeMin: 0 }, NOW), "DURATION")).toBe("PT2H");
  });

  it("puts the cinema and its address in the location, escaping commas", () => {
    expect(value(ics, "LOCATION")).toBe("Filmhouse Lekki IMAX\\, The Rock Drive\\, off Bisola Durosinmi Etti Drive\\, Lekki Phase 1\\, Lagos");
    expect(value(buildIcs({ ...showing, address: null }, NOW), "LOCATION")).toBe("Filmhouse Lekki IMAX"); // never a guessed address
  });

  it("describes where to book and where the time came from", () => {
    expect(unescape(value(ics, "DESCRIPTION")!)).toBe("Book on the cinema's site: https://www.filmhouseng.com/\nRead from Filmhouse's site 2 hours ago. Times can change; check with the cinema.");
    expect(unescape(value(buildIcs({ ...showing, bookingUrl: null }, NOW), "DESCRIPTION")!)).toBe(
      "Tickets at the cinema.\nRead from Filmhouse's site 2 hours ago. Times can change; check with the cinema.",
    );
  });

  it("escapes text that would break the file", () => {
    const out = buildIcs({ ...showing, film: "Love; Actually, Again\\Now\nPart 2" }, NOW);
    expect(value(out, "SUMMARY")).toBe("Love\; Actually\\, Again\\\\Now\\nPart 2 at Filmhouse Lekki IMAX");
  });

  it("refuses a start time that is not UTC", () => {
    expect(() => buildIcs({ ...showing, startsAt: "2026-11-06T19:30:00+01:00" }, NOW)).toThrow(/UTC/);
  });
});

describe("icsFileName: <film>-<cinema>-<time>.ics", () => {
  it("uses plain lowercase words and the Lagos day and time", () => {
    expect(icsFileName(showing)).toBe("sinners-filmhouse-lekki-imax-2026-11-06-1930.ics");
  });

  it("strips accents and punctuation, and names an after-midnight show by its Lagos date", () => {
    expect(icsFileName({ ...showing, film: "Ọmọ Ghetto: The Saga!", startsAt: "2026-11-06T23:30:00Z" })).toBe("omo-ghetto-the-saga-filmhouse-lekki-imax-2026-11-07-0030.ics");
  });
});
