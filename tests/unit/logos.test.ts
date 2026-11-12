import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import cinemas from "../../data/cinemas.json";
import logos from "../../data/logos.json";

// Each chain's own logo on the Cinemas tab (D-56). Files are trimmed to the logo's own marks, so a
// tile centres them exactly, and kept small: they load on every cinema row.
const PUBLIC = join(import.meta.dirname, "../../public/logos");
const size = (file: string) => {
  const png = readFileSync(join(PUBLIC, file));
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
};

describe("chain logos (D-56)", () => {
  it("has a logo for every chain in the registry", () => {
    const chains = [...new Set(cinemas.cinemas.map((c) => c.chain))];
    expect(chains.filter((chain) => !(chain in logos.chains))).toEqual([]);
  });

  it("names where each logo came from, on the chain's own site", () => {
    for (const [chain, logo] of Object.entries(logos.chains)) expect(logo.source, chain).toMatch(/^https:\/\//);
  });

  for (const [chain, logo] of Object.entries(logos.chains)) {
    it(`${chain}: a PNG under 24 KB that fits a 176 × 132 tile`, () => {
      const file = join(PUBLIC, logo.file);
      expect(existsSync(file)).toBe(true);
      expect(logo.file).toMatch(/\.png$/);
      expect(statSync(file).size).toBeLessThan(24 * 1024);
      const { width, height } = size(logo.file);
      expect(width).toBeLessThanOrEqual(176);
      expect(height).toBeLessThanOrEqual(132);
      expect(["light", "dark", "fill"]).toContain(logo.tile);
    });
  }
});
