import { describe, expect, it } from "vitest";
import { showingLine, showingSentence } from "@/lib/wording/showing";

const START = "2026-11-06T18:30:00Z"; // 19:30 in Lagos, Fri 6 Nov
const FRESH = "Read from Filmhouse's site 2 hours ago";
const row = { film: "Sinners", cinema: "Filmhouse Lekki", startsAt: START, freshness: FRESH };

describe("showing line (DATA §Showing wording, D-05)", () => {
  it.each([
    ["2026-11-06T17:10:00Z", "19:30 · Starts in 1 h 20 min"],
    ["2026-11-06T18:24:00Z", "19:30 · Starts in 6 min"],
    ["2026-11-06T18:35:00Z", "19:30 · Started 5 min ago"],
  ])("at %s reads %s", (now, text) => {
    expect(showingLine(START, now)).toBe(text);
  });

  it("is hidden once the showing has ended", () => {
    expect(showingLine(START, "2026-11-06T19:00:01Z")).toBeNull();
  });

  it("marks a showing after midnight with its day", () => {
    expect(showingLine("2026-11-06T23:30:00Z", "2026-11-06T22:00:00Z")).toBe("00:30 (Sat) · Starts in 1 h 30 min");
  });
});

describe("the full sentence a screen reader hears (SPEC §7)", () => {
  it.each([
    ["2026-11-06T17:45:00Z", "Sinners, Filmhouse Lekki, today at 19:30, starts in 45 minutes. Read from Filmhouse's site 2 hours ago."],
    ["2026-11-06T17:10:00Z", "Sinners, Filmhouse Lekki, today at 19:30, starts in 1 hour 20 minutes. Read from Filmhouse's site 2 hours ago."],
    ["2026-11-06T16:30:00Z", "Sinners, Filmhouse Lekki, today at 19:30, starts in 2 hours. Read from Filmhouse's site 2 hours ago."],
    ["2026-11-06T18:29:00Z", "Sinners, Filmhouse Lekki, today at 19:30, starts in 1 minute. Read from Filmhouse's site 2 hours ago."],
    ["2026-11-06T18:29:30Z", "Sinners, Filmhouse Lekki, today at 19:30, starting now. Read from Filmhouse's site 2 hours ago."],
    ["2026-11-06T18:35:00Z", "Sinners, Filmhouse Lekki, today at 19:30, started 5 minutes ago. Read from Filmhouse's site 2 hours ago."],
    ["2026-11-05T18:00:00Z", "Sinners, Filmhouse Lekki, tomorrow at 19:30, starts in 24 hours 30 minutes. Read from Filmhouse's site 2 hours ago."],
    ["2026-11-03T18:00:00Z", "Sinners, Filmhouse Lekki, Fri 6 Nov at 19:30, starts in 72 hours 30 minutes. Read from Filmhouse's site 2 hours ago."],
  ])("at %s", (now, sentence) => {
    expect(showingSentence(row, now)).toBe(sentence);
  });

  it("is null once the showing has ended", () => {
    expect(showingSentence(row, "2026-11-06T19:00:01Z")).toBeNull();
  });
});
