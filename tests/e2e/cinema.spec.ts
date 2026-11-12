import { expect, test } from "@playwright/test";
import { dataFile, freeze, sampleTime, today } from "./helpers";

// A cinema's page: its films as poster cards (D-49).
test("a cinema's page shows its films as poster cards, with a poster on every one", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const now = await sampleTime(request, "10:00");
  const id = "genesis-purple-lekki";
  const films = [...new Set(today(all, now).filter((s) => s.cinemaId === id).map((s) => s.filmId))];
  await freeze(page, now);
  await page.goto(`/cinema/${id}`);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Genesis Deluxe Purple Mall");
  expect(await page.locator('[data-testid^="film.card."]').evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.replace("film.card.", "")))).toEqual(films);

  // A film TMDB has a poster for shows it; one it does not gets a title poster. Never an empty box.
  const withPoster = films.find((f) => all.films.find((x) => x.id === f)?.posterPath);
  const without = films.find((f) => !all.films.find((x) => x.id === f)?.posterPath);
  expect(withPoster && without).toBeTruthy();
  await expect(page.getByTestId(`film.card.${withPoster}`).locator("img")).toHaveAttribute("src", /^https:\/\/image\.tmdb\.org\/t\/p\/w\d+\//);
  const title = all.films.find((x) => x.id === without)!.title;
  await expect(page.getByTestId(`film.card.${without}`).getByTestId("poster.title")).toHaveText(title);
  for (const card of await page.locator('[data-testid^="film.card."]').all()) {
    expect(await card.locator("img, [data-testid='poster.title']").count()).toBe(1);
  }
  await expect(page.getByTestId("cinema.source")).toContainText("Lagocine");
});

test("the grid is five across on a desktop and two on a phone", async ({ page, request }) => {
  await freeze(page, await sampleTime(request, "10:00"));
  const columns = async () => page.locator('[data-testid^="film.card."]').evaluateAll((els) => new Set(els.map((el) => Math.round(el.getBoundingClientRect().left))).size);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/cinema/genesis-purple-lekki");
  expect(await columns()).toBe(5);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await columns()).toBe(2);
});

test("a cinema with nothing left today says so and offers tomorrow", async ({ page, request }) => {
  await freeze(page, await sampleTime(request, "23:55"));
  await page.goto("/cinema/genesis-purple-lekki");
  await expect(page.locator('[data-testid^="film.card."]')).toHaveCount(0);
  await expect(page.getByTestId("empty.day")).toContainText("Nothing more is showing today");
});
