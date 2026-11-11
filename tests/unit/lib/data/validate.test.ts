import { describe, expect, it } from "vitest";
import example from "../../../../docs/examples/showtimes-v1.example.json";
import { validateShowtimes } from "@/lib/data/validate";

// Each case is the DATA.md example with one thing broken, so a failure names the rule it tests.
type Loose = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const broken = (change: (file: Loose) => void): Loose => {
  const copy = structuredClone(example) as Loose;
  change(copy);
  return copy;
};
const refused = (input: unknown, options = {}) => {
  const result = validateShowtimes(input, options);
  if (result.ok) throw new Error("expected the file to be refused");
  return result.errors.join("\n");
};
const accepted = (input: unknown, options = {}) => {
  const result = validateShowtimes(input, options);
  if (!result.ok) throw new Error(`expected the file to be accepted:\n${result.errors.join("\n")}`);
  return result;
};

describe("validateShowtimes: the DATA.md example", () => {
  it("validates as written, with nothing dropped or changed", () => {
    const result = accepted(example);
    expect(result.log).toEqual([]);
    expect(result.file).toEqual(example);
  });

  it("does not change the object it is given", () => {
    const input = broken((f) => (f.showings[0].bookingUrl = "http://www.filmhouseng.com/"));
    const before = structuredClone(input);
    accepted(input);
    expect(input).toEqual(before);
  });

  it("ignores keys it does not know, so a newer writer can add fields", () => {
    const result = accepted(broken((f) => ((f.newField = 1), (f.showings[0].seatsLeft = 12))));
    expect(result.log).toEqual([]);
  });
});

describe("validateShowtimes: rules that refuse the file", () => {
  it("refuses anything that is not an object", () => {
    expect(refused(null)).toMatch(/not an object/);
    expect(refused("[]")).toMatch(/not an object/);
  });

  it("refuses a schemaVersion other than 1", () => {
    expect(refused(broken((f) => (f.schemaVersion = 2)))).toBe("schemaVersion must be 1, got 2");
  });

  it("refuses a time zone other than Africa/Lagos", () => {
    expect(refused(broken((f) => (f.timeZone = "UTC")))).toBe('timeZone must be "Africa/Lagos", got "UTC"');
  });

  it.each([
    ["a local time with an offset", "2026-11-06T19:30:00+01:00"],
    ["a time with no zone", "2026-11-06T19:30:00"],
    ["a time without seconds", "2026-11-06T18:30Z"],
    ["a time with milliseconds", "2026-11-06T18:30:00.000Z"],
    ["a date that does not exist", "2026-02-30T18:30:00Z"],
    ["a number", 1794000000],
  ])("refuses %s as a showing's startsAt", (_, value) => {
    expect(refused(broken((f) => (f.showings[1].startsAt = value)))).toBe(
      `showings[1].startsAt must be a UTC time like 2026-11-06T18:30:00Z, got ${JSON.stringify(value)}`,
    );
  });

  it("refuses a local time in generatedAt, a source's fetchedAt or lastOkAt, a showing's fetchedAt and via.fetchedAt", () => {
    const local = "2026-11-06T15:05:00+01:00";
    expect(refused(broken((f) => (f.generatedAt = local)))).toMatch(/^generatedAt must be a UTC time/);
    expect(refused(broken((f) => (f.sources[0].fetchedAt = local)))).toMatch(/^sources\[0\]\.fetchedAt must be a UTC time/);
    expect(refused(broken((f) => (f.sources[1].lastOkAt = local)))).toMatch(/^sources\[1\]\.lastOkAt must be a UTC time/);
    expect(refused(broken((f) => (f.showings[0].fetchedAt = local)))).toMatch(/^showings\[0\]\.fetchedAt must be a UTC time/);
    expect(refused(broken((f) => (f.showings[1].via.fetchedAt = local)))).toMatch(/^showings\[1\]\.via\.fetchedAt must be a UTC time/);
  });

  it("allows a source that has never been read", () => {
    accepted(broken((f) => ((f.sources[0].fetchedAt = null), (f.sources[0].lastOkAt = null))));
  });

  it("refuses a source status or method it does not know", () => {
    expect(refused(broken((f) => (f.sources[0].status = "ok")))).toBe(
      'sources[0].status must be one of cleared, pending, refused, do-not-use, got "ok"',
    );
    expect(refused(broken((f) => (f.sources[0].method = "scrape")))).toMatch(/^sources\[0\]\.method must be one of/);
  });

  it("fails a scheduled run that includes a source that is not cleared", () => {
    expect(refused(example, { scheduled: true })).toBe(
      'sources[0] "filmhouse" is pending: only cleared sources run on a schedule (D-08)\n' +
        'sources[1] "lagocine" is pending: only cleared sources run on a schedule (D-08)',
    );
    accepted(broken((f) => f.sources.forEach((s: Loose) => (s.status = "cleared"))), { scheduled: true });
  });

  it("refuses a missing list or a row with a missing id, and reports every problem at once", () => {
    const errors = refused(broken((f) => (delete f.films, delete f.cinemas[0].id, (f.schemaVersion = 3))));
    expect(errors.split("\n")).toEqual([
      "schemaVersion must be 1, got 3",
      "cinemas[0].id must be a non-empty string, got undefined",
      "films must be a list",
    ]);
  });

  it("refuses two films, cinemas or sources with the same id", () => {
    expect(refused(broken((f) => (f.films[1].id = f.films[0].id)))).toBe('films[1].id "spider-man-brand-new-day" is used twice');
  });

  it("refuses credits the wording could not read: an unknown confidence or a broken source list", () => {
    expect(refused(broken((f) => (f.films[0].credits.confidence = "sure")))).toMatch(/^films\[0\]\.credits\.confidence must be one of/);
    expect(refused(broken((f) => delete f.films[0].credits.sources))).toMatch(/^films\[0\]\.credits\.sources must be a list/);
    expect(refused(broken((f) => (f.films[0].credits.sources = [{ name: "TMDB" }])))).toMatch(/^films\[0\]\.credits\.sources must be a list/);
    accepted(broken((f) => (f.films[0].credits = null)));
  });
});

describe("validateShowtimes: rules that drop or repair a row and say so", () => {
  it("drops a showing whose source is not in the file", () => {
    const result = accepted(broken((f) => (f.showings[0].sourceId = "genesis")));
    expect(result.file.showings.map((s) => s.cinemaId)).toEqual(["ebonylife-vi"]);
    expect(result.log).toEqual([
      'Dropped showing filmhouse-lekki-imax_spider-man-brand-new-day_2026-11-06T18:30:00Z: its source "genesis" is not in the file',
    ]);
  });

  it("drops a showing with no fetchedAt", () => {
    const result = accepted(broken((f) => delete f.showings[1].fetchedAt));
    expect(result.file.showings).toHaveLength(1);
    expect(result.log).toEqual(["Dropped showing ebonylife-vi_one-gidi-night_2026-11-06T19:15:00Z: it has no fetchedAt"]);
  });

  it("drops a showing whose film or cinema is not in the file", () => {
    const result = accepted(broken((f) => ((f.showings[0].filmId = "sinners"), (f.showings[1].cinemaId = "nowhere"))));
    expect(result.file.showings).toEqual([]);
    expect(result.log).toHaveLength(2);
    expect(result.log[0]).toMatch(/its film "sinners" is not in the file$/);
    expect(result.log[1]).toMatch(/its cinema "nowhere" is not in the file$/);
  });

  it.each([
    ["plain http", "http://www.filmhouseng.com/"],
    ["another site's domain", "https://tickets.example.com/filmhouse"],
    ["a look-alike domain", "https://filmhouseng.com.example.com/"],
    ["a tracking parameter", "https://www.filmhouseng.com/?utm_source=sinima"],
    ["a click id", "https://www.filmhouseng.com/?fbclid=abc"],
    ["a newer click id", "https://www.filmhouseng.com/?gbraid=abc"],
    ["something that is not a URL", "book at the door"],
  ])("sets a booking link with %s to null", (_, url) => {
    const result = accepted(broken((f) => (f.showings[0].bookingUrl = url)));
    expect(result.file.showings[0]?.bookingUrl).toBeNull();
    expect(result.log).toHaveLength(1);
    expect(result.log[0]).toMatch(/^Removed the booking link from showing filmhouse-lekki-imax_/);
  });

  it("keeps a booking link on the cinema's booking engine and one with the cinema's own query", () => {
    const veezi = "https://ticketing.eu.veezi.com/purchase/321781?siteToken=9chn7w68550a7sxgexpdng2ndm";
    const result = accepted(
      broken((f) => {
        f.cinemas[0].bookingHost = "ticketing.eu.veezi.com";
        f.showings[0].bookingUrl = veezi;
      }),
    );
    expect(result.file.showings[0]?.bookingUrl).toBe(veezi);
    expect(result.log).toEqual([]);
  });

  it("keeps the most recently fetched of two showings of one film at one cinema and time", () => {
    const result = accepted(
      broken((f) => {
        const older = { ...f.showings[0], id: "older-copy", fetchedAt: "2026-11-06T09:00:00Z", format: "2D" };
        f.showings.unshift(older);
      }),
    );
    expect(result.file.showings).toHaveLength(2);
    expect(result.file.showings.find((s) => s.cinemaId === "filmhouse-lekki-imax")?.format).toBe("IMAX");
    expect(result.log).toEqual([
      "Dropped a duplicate of filmhouse-lekki-imax_spider-man-brand-new-day_2026-11-06T18:30:00Z (kept the copy fetched at 2026-11-06T14:05:00Z)",
    ]);
  });

  it('turns a credits "no" with no source into "unknown" (D-10)', () => {
    const result = accepted(
      broken((f) => (f.films[0].credits = { during: "no", after: "no", confidence: "confirmed", sources: [], count: null })),
    );
    expect(result.file.films[0]?.credits).toEqual({ during: "unknown", after: "unknown", confidence: "unknown", sources: [], count: null });
    expect(result.log).toEqual(['Film spider-man-brand-new-day: credits "no" has no source, so it is now "unknown"']);
  });

  it('keeps a credits "no" that has a source, and a "yes" beside a dropped "no"', () => {
    const source = { name: "Chime", url: "https://example.com/review", checkedAt: "2026-11-05T10:00:00Z" };
    const sourced = accepted(
      broken((f) => (f.films[0].credits = { during: "no", after: "no", confidence: "confirmed", sources: [source], count: null })),
    );
    expect(sourced.file.films[0]?.credits?.after).toBe("no");
    expect(sourced.log).toEqual([]);

    const mixed = accepted(broken((f) => (f.films[0].credits = { during: "no", after: "yes", confidence: "likely", sources: [], count: null })));
    expect(mixed.file.films[0]?.credits).toMatchObject({ during: "unknown", after: "yes", confidence: "likely" });
  });

  it("turns a missing booking link or price into null without a log line", () => {
    const result = accepted(broken((f) => (delete f.showings[0].bookingUrl, delete f.showings[0].price)));
    expect(result.file.showings[0]).toMatchObject({ bookingUrl: null, price: null });
    expect(result.log).toEqual([]);
  });

  it("drops a second showing that reuses another showing's id", () => {
    const result = accepted(broken((f) => f.showings.push({ ...f.showings[0], startsAt: "2026-11-06T21:00:00Z" })));
    expect(result.file.showings.map((s) => s.startsAt)).toEqual(["2026-11-06T18:30:00Z", "2026-11-06T19:15:00Z"]);
    expect(result.log).toEqual([
      "Dropped showing filmhouse-lekki-imax_spider-man-brand-new-day_2026-11-06T18:30:00Z (2026-11-06T21:00:00Z): another showing already has that id",
    ]);
  });

  it("does not log a repair to a showing that has already ended", () => {
    const result = accepted(broken((f) => ((f.showings[0].startsAt = "2026-11-06T12:00:00Z"), (f.showings[0].bookingUrl = "http://x.example/"))));
    expect(result.log).toEqual(["Removed 1 showing that ended more than an hour before 2026-11-06T16:05:00Z"]);
  });

  it.each([
    ["a fraction", { amountNgn: 6000.5, label: "Standard" }],
    ["text", { amountNgn: "6000", label: "Standard" }],
    ["a negative amount", { amountNgn: -1, label: null }],
    ["no amount", { label: "Standard" }],
  ])("drops a price with %s", (_, price) => {
    const result = accepted(broken((f) => (f.showings[1].price = price)));
    expect(result.file.showings[1]?.price).toBeNull();
    expect(result.log).toEqual(["Dropped the price from showing ebonylife-vi_one-gidi-night_2026-11-06T19:15:00Z: amountNgn must be a whole number of naira"]);
  });

  it("removes showings that ended more than an hour before the file was made", () => {
    // Ended means 30 min after the start (D-05), so the cut is 90 min before generatedAt (16:05).
    const result = accepted(
      broken((f) => {
        f.showings[0].startsAt = "2026-11-06T14:34:59Z";
        f.showings[1].startsAt = "2026-11-06T14:35:00Z";
      }),
    );
    expect(result.file.showings.map((s) => s.startsAt)).toEqual(["2026-11-06T14:35:00Z"]);
    expect(result.log).toEqual(["Removed 1 showing that ended more than an hour before 2026-11-06T16:05:00Z"]);
  });
});

describe("validateShowtimes: sample", () => {
  const fixtureSource = (f: Loose) => (f.sources[1].method = "fixture");

  it("sets sample to true when it is missing and a showing comes from a fixture", () => {
    const result = accepted(broken((f) => (delete f.sample, fixtureSource(f))));
    expect(result.file.sample).toBe(true);
  });

  it("sets sample to false when it is missing and no showing comes from a fixture", () => {
    expect(accepted(broken((f) => delete f.sample)).file.sample).toBe(false);
  });

  it("never lets a file with fixture showings claim to be real", () => {
    const result = accepted(broken((f) => ((f.sample = false), fixtureSource(f))));
    expect(result.file.sample).toBe(true);
    expect(result.log).toEqual(["sample was false but 1 showing comes from a fixture, so it is now true"]);
  });
});
