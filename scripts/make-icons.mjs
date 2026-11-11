// Draws the app icons from the logo file: node scripts/make-icons.mjs
// The icon is the white Ticket S on an ink tile; the dots are holes. Re-run after the mark changes.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "public", "icons");
const INK = "#0a0a0a";
const PAPER = "#ffffff";
const path = readFileSync(join(ROOT, "docs", "design", "logo", "sinima-mark.svg"), "utf8").match(/ d="([^"]+)"/)[1];

// The mark is 62 x 84 on a 100-unit grid, centred at (50, 50). `scale` shrinks it about the centre.
const icon = (radius, scale) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="${radius}" fill="${INK}"/>` +
  `<path transform="translate(50 50) scale(${scale}) translate(-50 -50)" fill="${PAPER}" fill-rule="evenodd" d="${path}"/></svg>`;

writeFileSync(join(OUT, "icon.svg"), icon(23, 0.72) + "\n");

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  // [file, pixels, corner radius, mark scale]. Phones round the corners themselves, so those are square;
  // the maskable icon keeps the mark inside the middle 80% that every launcher shows.
  for (const [file, size, radius, scale] of [
    ["icon-192.png", 192, 23, 0.72],
    ["icon-512.png", 512, 23, 0.72],
    ["icon-maskable-512.png", 512, 0, 0.58],
    ["apple-touch-icon.png", 180, 0, 0.68],
  ]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${icon(radius, scale)}`);
    await page.screenshot({ path: join(OUT, file), omitBackground: true });
    console.log(`wrote public/icons/${file}`);
  }
} finally {
  await browser.close();
}
