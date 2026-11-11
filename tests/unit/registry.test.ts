import { describe, expect, it } from "vitest";
import cinemas from "../../data/cinemas.json";
import sources from "../../data/sources.json";

describe("data registries", () => {
  it("places every cinema in a listed area", () => {
    const areas = new Set(cinemas.areas.map((a) => a.slug));
    const orphans = cinemas.cinemas.filter((c) => !areas.has(c.area)).map((c) => c.id);
    expect(orphans).toEqual([]);
  });

  it("gives every cinema a unique id", () => {
    const ids = cinemas.cinemas.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every area neighbours that are other listed areas (D-46)", () => {
    const areas = new Set(cinemas.areas.map((a) => a.slug));
    for (const area of cinemas.areas) {
      expect(area.neighbours.length, area.slug).toBeGreaterThan(0);
      expect(area.neighbours.filter((n) => !areas.has(n) || n === area.slug), area.slug).toEqual([]);
    }
  });

  it("only names cinemas that exist in the registry", () => {
    const ids = new Set(cinemas.cinemas.map((c) => c.id));
    const unknown = sources.sources.flatMap((s) => s.cinemaIds.filter((id) => !ids.has(id)));
    expect(unknown).toEqual([]);
  });
});
