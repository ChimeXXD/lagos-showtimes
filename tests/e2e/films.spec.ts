import { expect, test } from "@playwright/test";
import { dataFile, freeze, sampleTime } from "./helpers";

// SPEC §8, check 11 (D-22).
test("typing part of a title leaves only matching films, and tapping one opens its page", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const now = await sampleTime(request, "18:00");
  await freeze(page, now);
  await page.goto("/");

  // Only films with a showing still to start are showing.
  const items = page.locator('[data-testid^="films.item."]');
  const stillShowing = new Set(all.showings.filter((s) => Date.parse(s.startsAt) > now.getTime()).map((s) => s.filmId));
  expect(stillShowing.size).toBeGreaterThan(10);
  expect(stillShowing.size).toBeLessThan(all.films.length);
  await expect(items).toHaveCount(stillShowing.size);
  await page.getByTestId("films.filter").fill("  RAMA ");
  await expect(items).toHaveText([/^Ramayana/, /^Ramayana: Rise of a Legend/]);

  await page.getByTestId("films.filter").fill("zzz");
  await expect(items).toHaveCount(0);
  await expect(page.getByTestId("films.none")).toHaveText('No film showing matches "zzz".');

  await page.getByTestId("films.filter").fill("spider");
  await expect(items).toHaveCount(1);
  await items.first().click();
  await expect(page).toHaveURL(/\/film\/spider-man-brand-new-day$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Spider-Man: Brand New Day");
  expect(await page.locator('[data-testid^="showing.row."]').count()).toBeGreaterThan(0);
});

test("a film whose showings have all started is no longer listed as showing", async ({ page, request }) => {
  // Two days after the sample data's last day nothing is left to start.
  const late = new Date((await sampleTime(request, "18:00")).getTime() + 48 * 3_600_000);
  await freeze(page, late);
  await page.goto("/");
  await expect(page.getByTestId("empty.soon")).toBeVisible();
  await expect(page.locator('[data-testid^="films.item."]')).toHaveCount(0);
  await expect(page.getByTestId("films.filter")).toHaveCount(0);
});

test("an area page lists only the films showing in that area", async ({ page, request }) => {
  const surulere = await dataFile(request, "area/surulere");
  await freeze(page, await sampleTime(request, "09:00"));
  await page.goto("/area/surulere");
  const ids = await page.locator('[data-testid^="films.item."]').evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.replace("films.item.", "")));
  expect(ids.sort()).toEqual([...new Set(surulere.showings.map((s) => s.filmId))].sort());
});
