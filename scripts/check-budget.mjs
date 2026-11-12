// Page-weight budget on the built site (out/), D-21.
// For each budgeted page: gzip the HTML and every local script and stylesheet it references
// (script src, stylesheet and preload links), then compare with the limits below.
// Gzip size approximates what a host sends; real transfer adds headers and may use brotli.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const OUT = join(import.meta.dirname, "..", "out");
const KB = 1024;

// Limits in gzipped KB, set from the Day 0 measurement of the empty scaffold (D-21, D-26):
// baseline 131.9 KB JS and 136.1 KB total on 11 Nov 2026, plus an allowance for our code and
// one area's data. Add each new route to `pages` as it is built, with the data files it fetches
// (paths under out/): a fetched JSON file is not referenced in the HTML, so it must be listed.
const BUDGET = {
  // The fonts are loaded from the stylesheet, not the HTML, so they are listed here to be counted.
  // Each kind of page: home (Films), Cinemas, Starting soon, and the heaviest area, cinema and film page.
  pages: () =>
    ["index.html", "cinemas.html", "soon.html", heaviest("area"), heaviest("cinema"), heaviest("film")].map((html) => ({
      html,
      data: ["fonts/geist-sinima.woff2", "fonts/anton-sinima.woff2"],
    })),
  jsKb: 160,
  totalKb: 200,
};

/** The largest page in a folder of out/, e.g. "area/lekki.html". Pages of one kind share their scripts. */
function heaviest(dir) {
  const pages = existsSync(join(OUT, dir)) ? readdirSync(join(OUT, dir)).filter((name) => name.endsWith(".html")) : [];
  if (pages.length === 0) throw new Error(`check-budget: no pages in out/${dir}/`);
  const size = (name) => statSync(join(OUT, dir, name)).size;
  return `${dir}/${pages.reduce((a, b) => (size(b) > size(a) ? b : a))}`;
}

const gz = (path) => gzipSync(readFileSync(path), { level: 9 }).length;

function measure({ html: page, data }) {
  const htmlPath = join(OUT, page);
  const html = readFileSync(htmlPath, "utf8");
  const refs = new Set();
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)) {
    if (/\bnomodule\b/i.test(m[0])) continue; // legacy polyfills: modern browsers never fetch them
    refs.add(m[1]);
  }
  for (const m of html.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/g)) {
    if (/rel="(stylesheet|preload|modulepreload)"/.test(m[0])) refs.add(m[1]);
  }
  let js = 0;
  let css = 0;
  let other = 0;
  for (const ref of refs) {
    if (/^(https?:)?\/\//.test(ref)) continue; // third-party: none expected
    const file = join(OUT, decodeURIComponent(ref.split(/[?#]/)[0]));
    if (!existsSync(file)) {
      // Skipping it would under-count and let an over-budget page pass.
      throw new Error(`${page} references ${ref}, which is not in out/`);
    }
    const size = gz(file);
    if (file.endsWith(".js")) js += size;
    else if (file.endsWith(".css")) css += size;
    else other += size;
  }
  for (const file of data) other += gz(join(OUT, file));
  const htmlSize = gz(htmlPath);
  return { page, html: htmlSize, js, css, other, total: htmlSize + js + css + other };
}

if (!existsSync(OUT)) {
  console.error("check-budget: out/ not found. Run `npm run build` first.");
  process.exit(1);
}

const kb = (n) => (n / KB).toFixed(1).padStart(7);
let failed = false;
console.log("page                     html      js     css   other   total  (gzipped KB)");
for (const page of BUDGET.pages()) {
  const r = measure(page);
  console.log(`${r.page.padEnd(20)} ${kb(r.html)} ${kb(r.js)} ${kb(r.css)} ${kb(r.other)} ${kb(r.total)}`);
  if (r.js > BUDGET.jsKb * KB) {
    console.error(`  OVER: JS ${kb(r.js).trim()} KB > ${BUDGET.jsKb} KB`);
    failed = true;
  }
  if (r.total > BUDGET.totalKb * KB) {
    console.error(`  OVER: total ${kb(r.total).trim()} KB > ${BUDGET.totalKb} KB`);
    failed = true;
  }
}
console.log(`budget: JS <= ${BUDGET.jsKb} KB, total <= ${BUDGET.totalKb} KB per page`);
process.exit(failed ? 1 : 0);
