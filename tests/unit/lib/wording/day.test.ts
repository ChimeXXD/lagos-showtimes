import { describe, expect, it } from "vitest";
import { dayWords } from "@/lib/wording/day";

// CLAUDE.md rule 3: "today" and "tomorrow" are only said once the browser knows the time.
describe("dayWords", () => {
  it("says Today and Tomorrow when the time is known", () => {
    expect(dayWords(0, "2026-11-06T17:00:00Z", true)).toEqual({ name: "Today", on: "today" });
    expect(dayWords(1, "2026-11-07T17:00:00Z", true)).toEqual({ name: "Tomorrow", on: "tomorrow" });
  });

  it("names the date when it is not: the page's own HTML may be read on a later day", () => {
    expect(dayWords(0, "2026-11-06T17:00:00Z", false)).toEqual({ name: "Fri 6 Nov", on: "on Fri 6 Nov" });
    expect(dayWords(1, "2026-11-07T17:00:00Z", false)).toEqual({ name: "Sat 7 Nov", on: "on Sat 7 Nov" });
  });
});
