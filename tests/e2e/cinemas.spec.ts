import { expect, test } from "@playwright/test";
import { cinemasBySoonest, dataFile, freeze, lagosClock, sampleTime, today } from "./helpers";

// The Cinemas tab: cinemas near you, soonest first (D-49; no longer the home page since D-55).
test("an area's home lists its cinemas soonest first, each with its next times", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const now = await sampleTime(request, "18:00");
  const rows = today(all, now);
  const lekki = new Set(all.cinemas.filter((c) => c.area === "lekki").map((c) => c.id));
  const expected = cinemasBySoonest(rows).filter((id) => lekki.has(id));
  expect(expected.length).toBeGreaterThan(3);
  await freeze(page, now);
  await page.goto("/area/lekki");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cinemas near Lekki");
  const cards = page.getByTestId("group.area").locator('[data-testid^="cinema.card."]');
  expect(await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.replace("cinema.card.", "")))).toEqual(expected);

  const first = expected[0]!;
  const firstRow = rows.find((s) => s.cinemaId === first)!;
  const card = page.getByTestId(`cinema.card.${first}`);
  await expect(card.getByTestId("cinema.name")).toHaveText(all.cinemas.find((c) => c.id === first)!.name);
  // Since D-56 a row gives the next time in words; the times themselves are on the cinema's page.
  await expect(card.getByTestId("cinema.next")).toHaveText(new RegExp(`^Next at ${lagosClock(firstRow.startsAt)} · `));
  // Next door comes after, and is named.
  await expect(page.getByTestId("group.next").getByRole("heading", { level: 2 })).toHaveText("Next to Lekki");
  expect(await page.getByTestId("group.next").locator('[data-testid^="cinema.card."]').count()).toBeGreaterThan(0);
});

test("tapping a time opens that showing; sample data cannot be booked", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const now = await sampleTime(request, "18:00");
  const row = today(all, now).find((s) => all.cinemas.find((c) => c.id === s.cinemaId)!.area === "lekki")!;
  await freeze(page, now);
  await page.goto(`/cinema/${row.cinemaId}`); // the times moved here from the Cinemas tab (D-56)
  await page.getByTestId(`time.${row.filmId}.${row.startsAt}`).click();

  const panel = page.getByTestId("showing.panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("showing.title")).toHaveText(all.films.find((f) => f.id === row.filmId)!.title);
  await expect(panel.getByTestId("showing.cinema")).toHaveText(all.cinemas.find((c) => c.id === row.cinemaId)!.name);
  await expect(panel.getByTestId("showing.time")).toHaveText(lagosClock(row.startsAt));
  await expect(panel.getByTestId("showing.countdown")).toHaveText(/^Starts in /);
  await expect(panel.getByTestId("showing.freshness")).toHaveText("Sample data saved from Lagocine on 11 Nov");
  await expect(panel.getByTestId("showing.sample")).toHaveText("Sample only");
  await expect(panel.getByTestId("showing.book")).toHaveCount(0);
  await expect(page.getByTestId("banner.sample")).toHaveText("Sample data. These times are for the demo, not for booking.");

  await panel.getByTestId("showing.close").click();
  await expect(panel).toBeHidden();
});

test("a showing is gone from the card the minute it starts", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const row = today(all, await sampleTime(request, "18:00")).find((s) => all.cinemas.find((c) => c.id === s.cinemaId)!.area === "lekki")!;
  await freeze(page, new Date(Date.parse(row.startsAt) - 60_000));
  await page.goto(`/cinema/${row.cinemaId}`);
  const chip = page.getByTestId(`time.${row.filmId}.${row.startsAt}`);
  await expect(chip).toBeVisible();
  await page.clock.runFor(61_000);
  await expect(chip).toHaveCount(0);
});

test("Tomorrow shows the whole of the next day", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const built = new Date(all.generatedAt);
  const next = new Date(built.getTime() + 24 * 3_600_000);
  const tomorrow = all.showings.filter((s) => new Date(Date.parse(s.startsAt) + 3_600_000).toISOString().slice(0, 10) === new Date(next.getTime() + 3_600_000).toISOString().slice(0, 10));
  const id = "ebonylife-vi";
  const films = new Set(tomorrow.filter((s) => s.cinemaId === id).map((s) => s.filmId));
  expect(films.size).toBeGreaterThan(3);
  await freeze(page, built);
  await page.goto(`/cinema/${id}`);
  await page.getByTestId("day.tomorrow").click();
  await expect(page.locator('[data-testid^="film.card."]')).toHaveCount(films.size);
});

test("picking an area opens its page and is remembered; All Lagos forgets it", async ({ page }) => {
  await page.goto("/cinemas");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cinemas in Lagos");
  await page.getByTestId("pick.area").click();
  // The sheet opens over the page with every area on screen and not covered. A click alone would not
  // show this, because the test scrolls to what it clicks.
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => undefined))));
  const hidden = await page.locator('[data-testid^="sheet.area."]').evaluateAll((els) =>
    els.filter((el) => {
      const box = el.getBoundingClientRect();
      const y = box.top + box.height / 2;
      if (y > window.innerHeight) return false; // further down the page: reached by scrolling
      return box.left < 0 || box.right > window.innerWidth || !el.contains(document.elementFromPoint(box.left + box.width / 2, y));
    }).map((el) => el.getAttribute("data-testid")),
  );
  expect(hidden).toEqual([]);
  await page.getByTestId("sheet.area.ikeja").click();
  await expect(page).toHaveURL(/\/area\/ikeja$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cinemas near Ikeja");
  expect(await page.evaluate(() => localStorage.getItem("ls.area"))).toBe("ikeja");

  await page.goto("/cinemas");
  await expect(page).toHaveURL(/\/area\/ikeja$/);

  await page.getByTestId("pick.area").click();
  await page.getByTestId("sheet.area.all").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cinemas in Lagos");
  expect(await page.evaluate(() => localStorage.getItem("ls.area"))).toBeNull();
});

test("the heart keeps a cinema under Your cinemas, on this phone", async ({ page, request }) => {
  await freeze(page, await sampleTime(request, "18:00"));
  await page.goto("/area/lekki");
  await expect(page.getByTestId("saved")).toHaveCount(0);
  await page.getByTestId("cinema.card.grand-lekki").getByTestId("cinema.save").click();
  await expect(page.getByTestId("saved.row.grand-lekki")).toContainText("Grand Cinemas Lekki");
  await page.reload();
  await expect(page.getByTestId("saved.row.grand-lekki")).toBeVisible();
  await page.getByTestId("cinema.card.grand-lekki").getByTestId("cinema.save").click();
  await expect(page.getByTestId("saved")).toHaveCount(0);
});

test("choosing IMAX leaves only cinemas showing in IMAX, and says what was left out", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const now = await sampleTime(request, "10:00");
  const rows = today(all, now);
  const imax = [...new Set(rows.filter((s) => (s.format ?? "").startsWith("IMAX")).map((s) => s.cinemaId))];
  const silent = new Set(all.cinemas.map((c) => c.id).filter((id) => rows.some((s) => s.cinemaId === id) && !rows.some((s) => s.cinemaId === id && s.format)));
  expect(imax.length).toBeGreaterThan(0);
  await freeze(page, now);
  await page.goto("/cinemas");
  await page.getByTestId("pick.format").click();
  await page.getByTestId("format.option.IMAX").click();
  const shown = await page.locator('[data-testid^="cinema.card."]').evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.replace("cinema.card.", "")));
  expect(shown.sort()).toEqual(imax.sort());
  await expect(page.getByTestId("format.left-out")).toHaveText(`${silent.size} cinemas don't say the format of their showings, so they are not listed here.`);
});

// CLAUDE.md rule 3: the page's own HTML may be read on a later day than it was built.
for (const path of ["/area/lekki", "/cinemas", "/", "/soon", "/cinema/genesis-purple-lekki", "/film/ramayana"]) {
  test(`${path}: the page's own HTML holds absolute times and the sample banner, and no word that depends on the clock`, async ({ request }) => {
    const html = (await (await request.get(path)).text()).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<title>[^<]*<\/title>/, "");
    expect([...html.matchAll(/<time datetime="[^"]+Z"/gi)].length).toBeGreaterThan(5);
    expect(html).toContain("Sample data. These times are for the demo, not for booking.");
    const text = html.replace(/<[^>]+>/g, " ");
    expect(text).not.toMatch(/Starts in|Starting now|\bago\b|\bin \d+ (min|h)\b|\btoday\b|\btomorrow\b|\btonight\b|next 2 hours/i);
  });
}

test("/area/lekki's own HTML names its cinemas", async ({ request }) => {
  expect(await (await request.get("/area/lekki")).text()).toContain("Filmhouse Lekki IMAX");
});

for (const width of [390, 360, 320]) {
  test(`nothing scrolls sideways at ${width} px, and every time and button is at least 44 px tall`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 800 });
    await freeze(page, await sampleTime(request, "18:00"));
    await page.goto("/area/lekki");
    await expect(page.locator('[data-testid^="cinema.card."]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const short = await page.locator("main button, main a.chip, main a.btn, header a").evaluateAll((els) =>
      els.filter((el) => { const h = el.getBoundingClientRect().height; return h > 0 && h < 43.5; // half a pixel of rounding
      }).map((el) => el.outerHTML.slice(0, 90)),
    );
    expect(short).toEqual([]);
  });
}

// Chime, 13 Nov 2026: the "More areas" menu shows which area the pointer is on, in both themes.
for (const scheme of ["light", "dark"] as const) {
  test(`the More areas menu marks the area under the pointer (${scheme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/cinemas");
    await page.getByTestId("area.more").click();
    const option = page.getByTestId("area.option.surulere");
    const other = page.getByTestId("area.option.yaba");
    const idle = await other.evaluate((el) => getComputedStyle(el).backgroundColor);
    await option.hover();
    await expect(option).not.toHaveCSS("background-color", idle);
    await expect(other).toHaveCSS("background-color", idle);
  });
}
