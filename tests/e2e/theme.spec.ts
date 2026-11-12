import { expect, test } from "@playwright/test";

// The Lagoon tokens (D-53) as the browser actually renders them.
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

for (const [scheme, bg, text] of [
  ["light", "#eef6f4", "#0c3b47"],
  ["dark", "#0a0a0a", "#d9ebe7"],
] as const) {
  test(`the page uses the ${scheme} palette`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    const body = page.locator("body");
    await expect(body).toHaveCSS("background-color", rgb(bg));
    await expect(body).toHaveCSS("color", rgb(text));
    // The browser bar matches the page.
    await expect(page.locator(`meta[name="theme-color"][media*="${scheme}"]`)).toHaveAttribute("content", bg);
  });
}

test("the two fonts load from our own site and stay inside 40 KB together", async ({ page }) => {
  const fonts: { url: string; bytes: number }[] = [];
  page.on("response", async (res) => {
    if (res.url().endsWith(".woff2")) fonts.push({ url: res.url(), bytes: (await res.body()).length });
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('600 28px "Geist"'))).toBe(true);
  expect(fonts.map((f) => new URL(f.url).pathname).sort()).toEqual(["/fonts/anton-sinima.woff2", "/fonts/geist-sinima.woff2"]);
  expect(fonts.reduce((sum, f) => sum + f.bytes, 0)).toBeLessThanOrEqual(40 * 1024);
});

for (const width of [390, 360, 320]) {
  test(`nothing scrolls sideways at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
