import { expect, test } from "@playwright/test";

// Direction B tokens (D-34, D-35) as the browser actually renders them.
const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

for (const [scheme, bg, text] of [
  ["light", "#ffffff", "#0a0a0a"],
  ["dark", "#0a0a0a", "#fafafa"],
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

test("the Outfit font loads from our own site and stays inside the 30 KB limit", async ({ page }) => {
  const fonts: { url: string; bytes: number }[] = [];
  page.on("response", async (res) => {
    if (res.url().endsWith(".woff2")) fonts.push({ url: res.url(), bytes: (await res.body()).length });
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('600 28px "Outfit"'))).toBe(true);
  expect(fonts).toHaveLength(1);
  expect(new URL(fonts[0]!.url).pathname).toBe("/fonts/outfit-sinima.woff2");
  expect(fonts[0]!.bytes).toBeLessThanOrEqual(30 * 1024);
});

for (const width of [390, 360, 320]) {
  test(`nothing scrolls sideways at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
