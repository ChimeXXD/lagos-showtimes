import { readFileSync } from "node:fs";
import { join } from "node:path";

// Build time only. The browser-bar colour has to be written into the HTML as a plain value, so it is
// read from tokens.css instead of being typed a second time (colours live in that one file).
let cached: { light: string; dark: string } | undefined;
export function pageColours(): { light: string; dark: string } {
  if (cached) return cached;
  const css = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
  const match = css.match(/--color-bg:\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/i);
  if (!match) throw new Error("tokens.css: --color-bg must be written as light-dark(#rrggbb, #rrggbb)");
  cached = { light: match[1]!, dark: match[2]! };
  return cached;
}
