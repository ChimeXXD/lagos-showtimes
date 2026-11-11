// Fails when a colour value is written anywhere in src/ except src/styles/tokens.css.
// Part of `npm run lint` (CLAUDE.md: "No hard-coded colours").
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const ALLOWED = join("src", "styles", "tokens.css");
// Hex colours are 3, 4, 6 or 8 digits and never follow a word, a path or an entity ("&#123;").
const COLOUR =
  /(?<![\w/&])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const problems = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
  if (rel === ALLOWED || !/\.(tsx?|css)$/.test(file)) continue;
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (COLOUR.test(line)) problems.push(`${rel}:${i + 1}  ${line.trim()}`);
    });
}

if (problems.length > 0) {
  console.error("Hard-coded colours found. Use a token from src/styles/tokens.css:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("check-tokens: no hard-coded colours in src/");
