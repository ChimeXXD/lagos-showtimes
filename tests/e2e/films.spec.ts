import { expect, test } from "@playwright/test";
import { dataFile, freeze, lagosClock, sampleTime, today } from "./helpers";

test("Films (the home page, D-55) lists every film still showing; typing narrows it; a film opens its page", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const now = await sampleTime(request, "18:00");
  const showing = new Set(today(all, now).map((s) => s.filmId));
  await freeze(page, now);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Films in Lagos");
  const cards = page.locator('[data-testid^="film.card."]');
  await expect(cards).toHaveCount(showing.size);

  await page.getByTestId("films.filter").fill("  RAMA ");
  await expect(cards).toHaveCount([...showing].filter((id) => id.includes("rama")).length);
  await page.getByTestId("films.filter").fill("zzz");
  await expect(cards).toHaveCount(0);
  await expect(page.getByTestId("films.none")).toHaveText('No film showing matches "zzz".');

  await page.getByTestId("films.filter").fill("spider");
  await cards.first().getByRole("link").first().click();
  await expect(page).toHaveURL(/\/film\/spider-man-brand-new-day$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Spider-Man: Brand New Day");
  await expect(page.getByTestId("credits.chip")).toHaveText("Stay: scene after the credits · TMDB");
});

test("on a film's page, choosing IMAX and an area leaves only the cinemas that match (D-50)", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const now = await sampleTime(request, "10:00");
  const rows = today(all, now).filter((s) => s.filmId === "ramayana");
  const imax = rows.filter((s) => (s.format ?? "").startsWith("IMAX"));
  const cinemas = [...new Set(imax.map((s) => s.cinemaId))];
  const others = new Set(rows.map((s) => s.cinemaId).filter((id) => !cinemas.includes(id)));
  expect(cinemas.sort()).toEqual(["filmhouse-circle-mall", "filmhouse-lekki-imax"]);
  await freeze(page, now);
  await page.goto("/film/ramayana");

  const venues = page.locator('[data-testid^="venue."]');
  await expect(venues).toHaveCount(new Set(rows.map((s) => s.cinemaId)).size);
  await page.getByTestId("format.chip.IMAX").click();
  expect((await venues.evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.replace("venue.", "")))).sort()).toEqual(cinemas);
  await expect(page.getByTestId("format.left-out")).toHaveText(`${others.size} more cinemas show Ramayana in another format or don't say the format.`);
  const first = imax.find((s) => s.cinemaId === "filmhouse-lekki-imax")!;
  await expect(page.getByTestId("venue.filmhouse-lekki-imax").locator("[data-testid^='time.']").first()).toContainText(lagosClock(first.startsAt));

  await page.getByTestId("area.chip.victoria-island").click();
  await expect(venues).toHaveCount(0);
  await expect(page.getByTestId("empty.film")).toContainText("No cinema in Victoria Island is showing Ramayana in IMAX today");
});

for (const path of ["/film/ramayana", "/", "/cinemas", "/soon", "/cinema/ebonylife-vi"]) {
  test(`${path} does not scroll sideways on a phone`, async ({ page, request }) => {
    await freeze(page, await sampleTime(request, "10:00"));
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("Starting soon lists only what starts in the next 2 hours, soonest first", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const now = await sampleTime(request, "18:00");
  const soon = today(all, now).filter((s) => Date.parse(s.startsAt) - now.getTime() <= 2 * 3_600_000);
  await freeze(page, now);
  await page.goto("/soon");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Starting soon in Lagos");
  const times = await page.getByTestId("section.soon").locator("[data-testid^='time.']").allTextContents();
  expect(times.map((t) => t.slice(0, 5))).toEqual(soon.map((s) => lagosClock(s.startsAt)));
  await expect(page.getByTestId("section.soon").getByTestId("soon.countdown").first()).toHaveText(/^Starts in /);
});

test.describe("with the phone set to New York", () => {
  test.use({ timezoneId: "America/New_York" });
  test("times are still Lagos times", async ({ page, request }) => {
    const all = await dataFile(request, "all");
    const now = await sampleTime(request, "18:00");
    const row = today(all, now).find((s) => s.cinemaId === "ebonylife-vi")!;
    await freeze(page, now);
    await page.goto("/cinema/ebonylife-vi");
    expect(await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone)).toBe("America/New_York");
    await expect(page.locator("[data-testid^='time.']").first()).toContainText(lagosClock(row.startsAt));
  });
});
