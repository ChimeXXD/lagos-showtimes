// Cut a saved listing page down to the markup a parser reads, before it is committed (D-24).
// Full saved pages stay in the git-ignored tmp/. Posters, synopses, scripts and styles never
// enter the repo.
//
//   node scripts/reduce-fixture.ts <source> <saved.html> <out.html> <page-url> <saved-on yyyy-mm-dd>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import * as cheerio from "cheerio";

type Rule = {
  /** The one element that holds the listing. */
  keep: string;
  /** Removed from inside it, on top of ALWAYS_DROP. */
  drop: string[];
  /** Said in the fixture's header comment. */
  kept: string;
  removed: string;
};

// Never needed by a parser, whatever the source: code, styling and media (posters, D-08).
const ALWAYS_DROP = [
  "script", "style", "noscript", "iframe", "link", "meta", "object", "embed",
  "img", "picture", "source", "video", "audio", "svg", "canvas",
];
// Attributes that can carry a poster URL, styling or code on an element that stays.
const DROP_ATTRS = new Set(["style", "src", "srcset", "poster", "background"]);

const RULES: Record<string, Rule> = {
  // Veezi sessions pages (Silverbird): films, ratings, dates, times and purchase links.
  veezi: {
    keep: "#sessionsByDateConent",
    drop: [".poster-container"],
    kept: "titles, ratings, dates, times, links",
    removed: "page chrome, scripts, styles, the cinema banner and every poster image",
  },
};

const [source, input, output, pageUrl, savedOn] = process.argv.slice(2);
const rule = source && Object.hasOwn(RULES, source) ? RULES[source] : undefined;

function fail(message: string): never {
  console.error(`reduce-fixture: ${message}`);
  process.exit(1);
}

/** A real calendar date, not just the right shape ("2026-13-45" is refused). */
function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

if (!rule || !input || !output || !pageUrl || !savedOn) {
  fail(
    "usage: node scripts/reduce-fixture.ts <source> <saved.html> <out.html> <page-url> <saved-on yyyy-mm-dd>\n" +
      `sources: ${Object.keys(RULES).join(", ")}`,
  );
}
if (!isDate(savedOn)) fail(`"${savedOn}" is not a date (yyyy-mm-dd).`);
// The header is an HTML comment: "--" inside it would end it early or make it invalid.
if (!/^https?:\/\//.test(pageUrl) || !URL.canParse(pageUrl) || pageUrl.includes("--")) {
  fail(`"${pageUrl}" is not an http(s) page URL that fits in an HTML comment.`);
}
if (resolve(input) === resolve(output)) fail("the output would overwrite the saved page.");
if (!basename(output).startsWith(savedOn)) {
  fail(`the fixture's file name must start with the date it was saved (${savedOn}-...).`);
}

let saved: string;
try {
  saved = readFileSync(input, "utf8");
} catch (error) {
  fail(`cannot read ${input}: ${error instanceof Error ? error.message : String(error)}`);
}

const $ = cheerio.load(saved);
const listing = $(rule.keep);
if (listing.length !== 1) {
  fail(`"${rule.keep}" matched ${listing.length} elements in ${input}, expected 1. Has the page layout changed?`);
}
listing.find([...ALWAYS_DROP, ...rule.drop].join(", ")).remove();
listing.find("*").addBack().each((_, el) => {
  if (el.type !== "tag") return;
  for (const name of Object.keys(el.attribs)) {
    if (DROP_ATTRS.has(name) || name.startsWith("on")) $(el).removeAttr(name);
  }
});
// The page's own comments go too, so the only comment in a fixture is our header.
listing.find("*").addBack().contents().filter((_, node) => node.type === "comment").remove();

// Collapse the blank lines the removals leave behind.
const body = ($.html(listing) ?? "")
  .split("\n")
  .map((line) => line.trimEnd())
  .filter((line) => line.trim() !== "")
  .join("\n");

const header = [
  "<!--",
  `  FIXTURE. A cut-down copy of ${pageUrl}`,
  `  Saved on ${savedOn} (Africa/Lagos) with one manual request. Not live data.`,
  `  Kept: the listing element ${rule.keep} (${rule.kept}).`,
  `  Removed: ${rule.removed}.`,
  "  Made by scripts/reduce-fixture.ts (D-24).",
  "-->",
].join("\n");

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${header}\n${body}\n`);
console.log(`reduce-fixture: wrote ${output} (${Buffer.byteLength(body)} bytes of listing markup)`);
