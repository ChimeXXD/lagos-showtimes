import { expect, test } from "@playwright/test";

// The Ticket S logo (D-42) in the header, the browser tab, the home screen and the manifest.
test("the header shows the Ticket S mark beside the name", async ({ page }) => {
  await page.goto("/");
  const brand = page.getByTestId("wordmark");
  await expect(brand).toHaveText("Sinima");
  const mark = brand.locator("svg");
  await expect(mark).toBeVisible();
  await expect(mark).toHaveAttribute("aria-hidden", "true"); // the name beside it is the label
  // One cut shape: the notches and dots are holes, not painted circles.
  await expect(mark.locator("path")).toHaveAttribute("fill-rule", "evenodd");
});

test("the tab icon, home-screen icon and manifest icons all load", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((els) => els.map((e) => (e as HTMLLinkElement).href));
  expect(hrefs.some((h) => h.endsWith(".svg"))).toBe(true);
  expect(hrefs.some((h) => h.includes("apple-touch-icon"))).toBe(true);

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBe("/manifest.webmanifest");
  const manifest = await (await request.get(manifestHref!)).json();
  expect(manifest.name).toBe("Sinima");
  expect(manifest.display).toBe("standalone");
  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
  expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);

  for (const url of [...hrefs, ...manifest.icons.map((i: { src: string }) => i.src)]) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    expect(res.headers()["content-type"], url).toMatch(/^image\//);
  }
});

test("PNG icons are the size they claim", async ({ page }) => {
  await page.goto("/");
  for (const [src, size] of [["/icons/icon-192.png", 192], ["/icons/icon-512.png", 512], ["/icons/icon-maskable-512.png", 512], ["/icons/apple-touch-icon.png", 180]] as const) {
    const dims = await page.evaluate(async (s) => {
      const img = new Image();
      img.src = s;
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    }, src);
    expect(dims, src).toEqual([size, size]);
  }
});
