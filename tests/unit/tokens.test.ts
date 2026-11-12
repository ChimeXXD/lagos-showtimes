import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hasHardCodedColour } from "../../scripts/check-tokens.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const css = readFileSync(join(ROOT, "src", "styles", "tokens.css"), "utf8");

// Every colour token is written as `--color-name: light-dark(#light, #dark);`.
const colours = new Map<string, { light: string; dark: string }>();
for (const m of css.matchAll(/--color-([\w-]+):\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/gi)) {
  colours.set(m[1]!, { light: m[2]!, dark: m[3]! });
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
function pair(fg: string, bg: string, mode: "light" | "dark"): number {
  const f = colours.get(fg);
  const b = colours.get(bg);
  if (!f || !b) throw new Error(`missing token: ${fg} or ${bg}`);
  return contrast(f[mode], b[mode]);
}

describe("design tokens (D-53)", () => {
  it("defines every colour role in light and dark", () => {
    const roles = ["bg", "surface", "text", "text-muted", "accent", "accent-text", "book", "book-text", "stale", "focus", "line"];
    expect(roles.filter((r) => !colours.has(r))).toEqual([]);
  });

  it("uses the Lagoon colours from D-53: Teal for the primary button, Sea mist where white would be", () => {
    expect(colours.get("book")).toEqual({ light: "#0b6e69", dark: "#5fd4c8" });
    expect(colours.get("surface")?.light).toBe("#d9ebe7");
    expect(colours.get("text")?.dark).toBe("#d9ebe7");
    expect(colours.get("bg")?.dark).toBe("#0a0a0a");
  });

  it.each(["light", "dark"] as const)("keeps start times at AAA (7:1) in %s", (mode) => {
    expect(pair("text", "bg", mode)).toBeGreaterThanOrEqual(7);
    expect(pair("text", "surface", mode)).toBeGreaterThanOrEqual(7);
  });

  it.each(["light", "dark"] as const)("keeps all other text at AA (4.5:1) in %s", (mode) => {
    const pairs: [string, string][] = [
      ["text-muted", "bg"], ["text-muted", "surface"],
      ["stale", "bg"], ["stale", "surface"],
      ["book-text", "book"], ["accent-text", "accent"],
      ["book", "bg"], // direction B outlines and links in the Book colour
    ];
    const low = pairs.filter(([fg, bg]) => pair(fg, bg, mode) < 4.5).map(([fg, bg]) => `${fg} on ${bg}`);
    expect(low).toEqual([]);
  });

  it.each(["light", "dark"] as const)("keeps the focus ring at 3:1 against the page in %s", (mode) => {
    expect(pair("focus", "bg", mode)).toBeGreaterThanOrEqual(3);
    expect(pair("focus", "surface", mode)).toBeGreaterThanOrEqual(3);
  });
});

describe("check-tokens: colours outside tokens.css", () => {
  it.each([
    'color: #fff;',
    '<p style={{ background: "rgb(0 0 0)" }}>',
    '<p className="text-red-500">',
    '<div className="bg-white border-slate-200">',
    '<p className="hover:text-blue-700/50">',
    "color: red;",
    "border-bottom: 1px solid black;",
    '<p style={{ color: "white" }}>',
    '<p className="bg-[tomato]">',
  ])("flags %s", (line) => {
    expect(hasHardCodedColour(line)).toBe(true);
  });

  it.each([
    '<p className="mt-2 text-text-muted">Being built.</p>',
    '<a className="bg-book text-book-text rounded-full">Book</a>',
    "background: var(--color-surface);",
    "white-space: nowrap;",
    "<p>Read from Filmhouse's site 2 hours ago</p>",
    "outline: 2px solid var(--color-focus);",
    '<a href="/film/black-phone#times">',
    "color: currentColor;",
    "background: transparent;",
  ])("allows %s", (line) => {
    expect(hasHardCodedColour(line)).toBe(false);
  });
});
