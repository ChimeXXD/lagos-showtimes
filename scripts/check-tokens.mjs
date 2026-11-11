// Fails when a colour is written anywhere in src/ except src/styles/tokens.css: a hex or colour
// function, a named colour, or one of Tailwind's own palette classes.
// Part of `npm run lint` (CLAUDE.md: "No hard-coded colours").
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const ALLOWED = join("src", "styles", "tokens.css");
// Hex colours are 3, 4, 6 or 8 digits and never follow a word, a path or an entity ("&#123;").
const COLOUR =
  /(?<![\w/&])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/;
// The colour names people actually reach for. `transparent`, `currentColor` and `inherit` are fine.
const NAMED =
  "black|white|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|navy|teal|maroon|olive|lime|aqua|cyan|magenta|fuchsia|brown|gold|tomato|crimson|coral|salmon|indigo|violet|beige|ivory|khaki|tan";
// Tailwind's own palette (`text-red-500`, `bg-white`) and arbitrary named colours (`bg-[tomato]`).
// The palette is switched off in tokens.css, so these classes would silently do nothing.
const TAILWIND = new RegExp(
  "\\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|shadow|accent|caret|placeholder)-" +
    `(?:(?:slate|zinc|neutral|stone|amber|emerald|sky|rose|${NAMED})(?:-\\d{2,3})?(?![\\w-])|\\[(?:${NAMED})\\])`,
);
// A named colour as a value: `color: red;`, `border: 1px solid black`, `color: "white"`.
const NAMED_VALUE = new RegExp(
  `(?:^|[\\s;{(])(?:color|background(?:-color)?|border(?:-[a-z]+)*|outline(?:-color)?|fill|stroke|box-shadow|caret-color)\\s*:[^;]*?(?<![\\w-])["']?(?:${NAMED})["']?(?![\\w-])`,
  "i",
);

/** True when a line of src/ writes a colour instead of using a token. */
export function hasHardCodedColour(line) {
  return COLOUR.test(line) || TAILWIND.test(line) || NAMED_VALUE.test(line);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function main() {
  const problems = [];
  for (const file of walk(SRC)) {
    const rel = relative(ROOT, file);
    if (rel === ALLOWED || !/\.(tsx?|css)$/.test(file)) continue;
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (hasHardCodedColour(line)) problems.push(`${rel}:${i + 1}  ${line.trim()}`);
      });
  }

  if (problems.length > 0) {
    console.error("Hard-coded colours found. Use a token from src/styles/tokens.css:\n" + problems.join("\n"));
    process.exit(1);
  }
  console.log("check-tokens: no hard-coded colours in src/");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
