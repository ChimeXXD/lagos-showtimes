import { describe, expect, it } from "vitest";
import example from "../../../../docs/examples/showtimes-v1.example.json";
import type { ShowtimesFile } from "@/lib/data/types";
import { bannerFor, filmCounts, groupShowings, laterName, nextDayName, soonCount, toListData, type ListData } from "@/lib/data/select";

// Fri 6 Nov 2026, 18:00 in Lagos.
const NOW = "2026-11-06T17:00:00Z";
const file = example as ShowtimesFile;

const list = (starts: string[]): ListData => ({
  sample: false,
  films: [{ id: "whalefall", title: "Whalefall" }],
  cinemas: [{ id: "a", name: "A", area: "lekki" }],
  fresh: [{ source: "Lagocine", method: "public-page", url: "https://lagocine.com/", fetchedAt: "2026-11-06T16:00:00Z" }],
  rows: starts.map((at) => ({ at, film: 0, cinema: 0, format: null, book: null, fresh: 0 })),
});
const group = (starts: string[], now = NOW) => {
  const g = groupShowings(list(starts).rows, now);
  return { soon: g.soon.map((r) => r.at), later: g.later.map((r) => r.at), tomorrow: g.tomorrow.map((r) => r.at) };
};

describe("toListData", () => {
  const data = toListData(file);

  it("keeps what a row shows and drops the rest", () => {
    expect(data.sample).toBe(true);
    expect(data.films).toEqual([
      { id: "spider-man-brand-new-day", title: "Spider-Man: Brand New Day" },
      { id: "one-gidi-night", title: "One Gidi Night" },
    ]);
    expect(data.cinemas[1]).toEqual({ id: "ebonylife-vi", name: "EbonyLife Cinemas", area: "victoria-island" });
    expect(data.rows).toEqual([
      { at: "2026-11-06T18:30:00Z", film: 0, cinema: 0, format: "IMAX", book: "https://www.filmhouseng.com/", fresh: 0 },
      { at: "2026-11-06T19:15:00Z", film: 1, cinema: 1, format: "2D", book: "https://ebonylifecinemas.com/", fresh: 1 },
    ]);
  });

  it("stores each source-and-read-time once, with the site it was read through", () => {
    expect(data.fresh).toEqual([
      { source: "Filmhouse's site", method: "public-page", url: "https://filmhouseng.com/", fetchedAt: "2026-11-06T14:05:00Z" },
      {
        source: "Lagocine", method: "permission-feed", url: "https://lagocine.com/", fetchedAt: "2026-11-05T14:06:00Z",
        via: { name: "EbonyLife's site", url: "https://ebonylifecinemas.com/", fetchedAt: "2026-11-05T14:06:00Z" },
      },
    ]);
    const twice = toListData({ ...file, showings: [...file.showings, { ...file.showings[0]!, id: "x", startsAt: "2026-11-06T20:00:00Z" }] });
    expect(twice.fresh).toHaveLength(2);
    expect(twice.rows.map((r) => r.fresh)).toEqual([0, 1, 0]);
  });

  it("orders rows by start time and can keep only one film", () => {
    const reversed = toListData({ ...file, showings: [...file.showings].reverse() });
    expect(reversed.rows.map((r) => r.at)).toEqual(["2026-11-06T18:30:00Z", "2026-11-06T19:15:00Z"]);
    const one = toListData(file, { filmId: "one-gidi-night" });
    expect(one.rows).toHaveLength(1);
    expect(one.films).toEqual([{ id: "one-gidi-night", title: "One Gidi Night" }]);
  });
});

describe("filmCounts", () => {
  it("lists each film once with its number of showings, by title", () => {
    const twice = toListData({ ...file, showings: [...file.showings, { ...file.showings[0]!, id: "x", startsAt: "2026-11-06T20:00:00Z" }] });
    expect(filmCounts(twice)).toEqual([
      { id: "one-gidi-night", title: "One Gidi Night", showings: 1 },
      { id: "spider-man-brand-new-day", title: "Spider-Man: Brand New Day", showings: 2 },
    ]);
  });
});

describe("filmCounts with the time", () => {
  const twice = toListData({ ...file, showings: [...file.showings, { ...file.showings[0]!, id: "x", startsAt: "2026-11-06T20:00:00Z" }] });

  it("counts only showings that have not started, and drops a film with none left", () => {
    // 19:30 in Lagos is 18:30Z, the second Spider-Man starts: it no longer counts. One Gidi Night is at 19:15Z.
    expect(filmCounts(twice, "2026-11-06T18:30:00Z")).toEqual([
      { id: "one-gidi-night", title: "One Gidi Night", showings: 1 },
      { id: "spider-man-brand-new-day", title: "Spider-Man: Brand New Day", showings: 1 },
    ]);
    expect(filmCounts(twice, "2026-11-06T19:15:00Z")).toEqual([{ id: "spider-man-brand-new-day", title: "Spider-Man: Brand New Day", showings: 1 }]);
    expect(filmCounts(twice, "2026-11-06T20:00:00Z")).toEqual([]);
  });
});

describe("groupShowings (D-05, D-18)", () => {
  it("puts the next 2 hours under Starting soon, up to and including the 2-hour mark", () => {
    expect(group(["2026-11-06T17:00:01Z", "2026-11-06T18:59:00Z", "2026-11-06T19:00:00Z", "2026-11-06T19:00:01Z"])).toEqual({
      soon: ["2026-11-06T17:00:01Z", "2026-11-06T18:59:00Z", "2026-11-06T19:00:00Z"],
      later: ["2026-11-06T19:00:01Z"],
      tomorrow: [],
    });
  });

  it("leaves out a showing from the second it starts", () => {
    expect(group(["2026-11-06T17:00:00Z", "2026-11-06T16:59:00Z", "2026-11-06T10:00:00Z"])).toEqual({ soon: [], later: [], tomorrow: [] });
  });

  it("keeps a show after midnight with tonight, and starts tomorrow at 04:00", () => {
    // 00:30 and 03:59 on Saturday belong to Friday evening; 10:00 on Saturday is tomorrow.
    expect(group(["2026-11-06T23:30:00Z", "2026-11-07T02:59:00Z", "2026-11-07T03:00:00Z", "2026-11-07T09:00:00Z"])).toEqual({
      soon: [],
      later: ["2026-11-06T23:30:00Z", "2026-11-07T02:59:00Z"],
      tomorrow: ["2026-11-07T03:00:00Z", "2026-11-07T09:00:00Z"],
    });
  });

  it("drops anything past tomorrow evening", () => {
    expect(group(["2026-11-08T09:00:00Z"]).tomorrow).toEqual([]);
  });

  it("after midnight, tonight is still the evening that began yesterday", () => {
    // 01:00 on Saturday: a 02:30 show is soon, 10:00 on Saturday is "tomorrow" (the next evening day).
    expect(group(["2026-11-07T01:30:00Z", "2026-11-07T09:00:00Z"], "2026-11-07T00:00:00Z")).toEqual({
      soon: ["2026-11-07T01:30:00Z"], later: [], tomorrow: ["2026-11-07T09:00:00Z"],
    });
  });

  it("sorts each section by start time", () => {
    expect(group(["2026-11-06T18:30:00Z", "2026-11-06T17:30:00Z"]).soon).toEqual(["2026-11-06T17:30:00Z", "2026-11-06T18:30:00Z"]);
  });

  it("counts what starts soon, for the neighbouring areas", () => {
    expect(soonCount(["2026-11-06T17:00:00Z", "2026-11-06T17:30:00Z", "2026-11-06T19:00:00Z", "2026-11-06T19:30:00Z"], NOW)).toBe(2);
  });
});

describe("bannerFor: one banner, the worst case wins (DATA §Freshness)", () => {
  it.each([
    [["fresh", "today"], null],
    [["fresh", "stale"], { kind: "stale", text: "Some times were read yesterday. Cinemas change programmes; check before you travel." }],
    [["stale", "old", "fresh"], { kind: "old", text: "Some times are more than a day old and may have changed." }],
    [["old", "sample", "stale"], { kind: "sample", text: "Sample data. These times are for the demo, not for booking." }],
    [[], null],
  ] as const)("%j", (bands, banner) => {
    expect(bannerFor([...bands])).toEqual(banner);
  });
});

describe("laterName: what the section after Starting soon is called", () => {
  it.each([
    ["2026-11-06T07:30:00Z", "Later today"], // 08:30 in Lagos
    ["2026-11-06T15:59:00Z", "Later today"], // 16:59
    ["2026-11-06T16:00:00Z", "Later tonight"], // 17:00
    ["2026-11-06T23:30:00Z", "Later tonight"], // 00:30, still the same evening
    ["2026-11-07T03:00:00Z", "Later today"], // 04:00, a new day
  ])("%s -> %s", (now, name) => {
    expect(laterName(now)).toBe(name);
  });
});

describe("nextDayName: what the last section is called", () => {
  it("is Tomorrow in the evening, and Today once midnight has passed but the evening has not ended", () => {
    expect(nextDayName("2026-11-06T17:00:00Z")).toBe("Tomorrow"); // 18:00 Friday
    expect(nextDayName("2026-11-07T00:00:00Z")).toBe("Today"); // 01:00 Saturday: Saturday's shows are today
    expect(nextDayName("2026-11-07T03:00:00Z")).toBe("Tomorrow"); // 04:00 Saturday
  });
});
