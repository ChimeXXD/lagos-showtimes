import { expect, test } from "@playwright/test";
import { freeze, sampleTime } from "./helpers";

// SPEC §8, check 3 (D-04).
test("every row says where its time came from", async ({ page, request }) => {
  await freeze(page, await sampleTime(request, "18:00"));
  await page.goto("/area/lekki");
  const rows = page.locator('[data-testid^="showing.row."]');
  const count = await rows.count();
  expect(count).toBeGreaterThan(10);
  await expect(page.getByTestId("showing.freshness")).toHaveCount(count);
  for (const line of await page.getByTestId("showing.freshness").allTextContents()) {
    expect(line).toBe("Sample data saved from Lagocine on 11 Nov");
  }
});

// The site only holds sample data, which never reads as stale. To see the real wording, this test
// rewrites the page on its way to the browser: the source becomes a live one that was read 30
// hours before the frozen clock. Nothing in the built site changes.
test("a source read 30 hours ago shows the stale wording on its rows, and the banner", async ({ page, request }) => {
  const now = await sampleTime(request, "18:00");
  const readAt = new Date(now.getTime() - 30 * 3_600_000).toISOString().replace(".000Z", "Z");
  await page.route("**/area/victoria-island", async (route) => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace(/(fetchedAt\\?":\\?")[0-9T:Z-]+/g, `$1${readAt}`)
      .replace(/(method\\?":\\?")fixture/g, "$1public-page")
      .replace(/(sample\\?":)true/g, "$1false");
    await route.fulfill({ response, body });
  });
  await freeze(page, now);
  await page.goto("/area/victoria-island");

  await expect(page.getByTestId("banner.stale")).toHaveText("Some times were read yesterday. Cinemas change programmes; check before you travel.");
  await expect(page.getByTestId("banner.sample")).toHaveCount(0);
  const lines = await page.getByTestId("section.soon").getByTestId("showing.freshness").allTextContents();
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines) {
    expect(line).toMatch(/^From Lagocine, which read (Filmhouse|EbonyLife)'s site yesterday at 12:00 · check with the cinema$/);
  }
  // Stale rows can still be booked (D-25); sample rows cannot, and here there are none.
  await expect(page.getByTestId("showing.sample")).toHaveCount(0);
});
