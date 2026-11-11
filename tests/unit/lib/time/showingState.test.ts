import { describe, expect, it } from "vitest";
import { countdown } from "@/lib/time/countdown";
import { isBeforeStart, showingState } from "@/lib/time/showingState";

const START = "2026-11-06T18:30:00Z"; // 19:30 in Lagos
/** `now` as an offset from the start: at("-00:10:01") is 10 min 1 s before; at("+00:30:00") is 30 min after. */
function at(offset: string): string {
  const [h, m, s] = offset.slice(1).split(":").map(Number) as [number, number, number];
  const ms = (h * 3600 + m * 60 + s) * 1000 * (offset.startsWith("-") ? -1 : 1);
  return new Date(Date.parse(START) + ms).toISOString().replace(".000Z", "Z");
}

describe("showingState at the boundary seconds (D-05)", () => {
  it.each([
    ["-05:00:00", "upcoming"],
    ["-00:10:01", "upcoming"],
    ["-00:10:00", "starting"], // exactly 10 min ahead
    ["-00:00:01", "starting"],
    ["+00:00:00", "started"], // the start instant
    ["+00:00:01", "started"],
    ["+00:30:00", "started"], // exactly 30 min after
    ["+00:30:01", "ended"],
    ["+09:00:00", "ended"],
  ] as const)("%s from the start is %s", (offset, state) => {
    expect(showingState(START, at(offset))).toBe(state);
  });

  it("a showing that has started is never before its start", () => {
    expect(isBeforeStart(showingState(START, at("-00:00:01")))).toBe(true);
    expect(isBeforeStart(showingState(START, at("+00:00:00")))).toBe(false);
    expect(isBeforeStart("started")).toBe(false);
    expect(isBeforeStart("ended")).toBe(false);
    expect(isBeforeStart("upcoming")).toBe(true);
  });

  it("refuses times that are not UTC", () => {
    expect(() => showingState("2026-11-06T19:30:00", START)).toThrow(/UTC/);
    expect(() => showingState(START, "2026-11-06T19:30:00+01:00")).toThrow(/UTC/);
  });
});

describe("countdown wording (SPEC §3)", () => {
  it.each([
    ["-01:20:00", "Starts in 1 h 20 min"],
    ["-02:00:00", "Starts in 2 h"],
    ["-01:00:00", "Starts in 1 h"],
    ["-00:59:59", "Starts in 59 min"],
    ["-00:45:00", "Starts in 45 min"],
    ["-00:44:30", "Starts in 44 min"], // rounds down: never promise more time than there is
    ["-00:03:00", "Starts in 3 min"],
    ["-00:01:00", "Starts in 1 min"],
    ["-00:00:59", "Starting now"],
    ["-00:00:01", "Starting now"],
    ["+00:00:00", "Started just now"],
    ["+00:00:59", "Started just now"],
    ["+00:01:00", "Started 1 min ago"],
    ["+00:05:00", "Started 5 min ago"],
    ["+00:05:59", "Started 5 min ago"],
    ["+00:30:00", "Started 30 min ago"],
  ] as const)("%s from the start reads %s", (offset, text) => {
    expect(countdown(START, at(offset))).toBe(text);
  });

  it("says nothing once the showing has ended (it is hidden)", () => {
    expect(countdown(START, at("+00:30:01"))).toBeNull();
  });

  it("counts long waits in hours and minutes", () => {
    expect(countdown(START, at("-26:05:00"))).toBe("Starts in 26 h 5 min");
  });
});
