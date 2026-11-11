import { expect, test } from "@playwright/test";
import { dataFile, freeze, lagosClock, lagosDay, sampleTime, startingSoon } from "./helpers";

// SPEC §8, checks 1 and 13 (D-18).
test("an area page lists only the next 2 hours under Starting soon, in time order", async ({ page, request }) => {
  const now = await sampleTime(request, "18:00");
  const expected = startingSoon(await dataFile(request, "area/lekki"), now).map(lagosClock);
  expect(expected.length).toBeGreaterThan(3);
  await freeze(page, now);
  await page.goto("/area/lekki");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Starting soon in Lekki");
  const soon = page.getByTestId("section.soon");
  await expect(soon.getByRole("heading")).toHaveText("Starting soon");
  await expect(soon.getByTestId("showing.time")).toHaveText(expected);
  await expect(soon.getByTestId("showing.countdown").first()).toHaveText(/^(Starts in \d|Starting now)/);

  const later = await page.getByTestId("section.later").getByTestId("showing.time").allTextContents();
  expect(later.length).toBeGreaterThan(0);
  expect(later.every((t) => t > "20:00")).toBe(true);
  expect(later).toEqual([...later].sort());
});

test("a showing is gone from the list the minute it starts, and the countdown moves with the clock", async ({ page, request }) => {
  const lekki = await dataFile(request, "area/lekki");
  const now = await sampleTime(request, "18:00");
  const first = startingSoon(lekki, now)[0]!;
  await freeze(page, new Date(Date.parse(first) - 60_000));
  await page.goto("/area/lekki");
  const soon = page.getByTestId("section.soon");
  await expect(soon.getByTestId("showing.time").first()).toHaveText(lagosClock(first));
  await expect(soon.getByTestId("showing.countdown").first()).toHaveText("Starts in 1 min");

  await page.clock.runFor(61_000);
  await expect(soon.getByTestId("showing.time").first()).not.toHaveText(lagosClock(first));
});

test("the page's own HTML holds the time-ordered list with absolute times and no relative words", async ({ request }) => {
  const html = await (await request.get("/area/lekki")).text();
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
  const starts = [...body.matchAll(/<time datetime="([^"]+)"/gi)].map((m) => m[1]);
  expect(starts.length).toBeGreaterThan(20);
  expect(starts).toEqual([...starts].sort());
  expect(body).not.toMatch(/Starts in|Starting now|\bago\b|\bToday\b|\bTomorrow\b|\btonight\b/i);
});

test("a returning visitor who opens / lands on their saved area", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ls.area", "lekki"));
  await page.goto("/");
  await expect(page).toHaveURL(/\/area\/lekki$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Starting soon in Lekki");
});

test("a first visit sees all of Lagos; picking an area opens its page and is remembered", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Starting soon in Lagos");
  await page.getByTestId("area.button").click();
  await expect(page.getByTestId("area.option.ikeja")).toHaveText("Ikeja · 2 cinemas");
  await page.getByTestId("area.option.ikeja").click();
  await expect(page).toHaveURL(/\/area\/ikeja$/);
  await expect(page.getByTestId("area.button")).toContainText("Ikeja");
  expect(await page.evaluate(() => localStorage.getItem("ls.area"))).toBe("ikeja");

  // "All Lagos" forgets the area, so / stays on all of Lagos next time.
  await page.getByTestId("area.button").click();
  await page.getByTestId("area.option.all").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Starting soon in Lagos");
  expect(await page.evaluate(() => localStorage.getItem("ls.area"))).toBeNull();
});

test("a saved area that no longer exists does not send / anywhere", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ls.area", "atlantis"));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Starting soon in Lagos");
});

for (const width of [390, 360, 320]) {
  test(`the area page does not scroll sideways at ${width} px, and every button is at least 44 px tall`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 800 });
    await freeze(page, await sampleTime(request, "18:00"));
    await page.goto("/area/lekki");
    await expect(page.getByTestId("section.soon")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const short = await page.locator("button, a[data-testid='wordmark'], [data-testid='showing.sample']").evaluateAll((els) =>
      els.filter((el) => el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().height < 44).map((el) => el.outerHTML.slice(0, 80)),
    );
    expect(short).toEqual([]);
  });
}

test("on the day the data was made, / shows soon, then later, then all of tomorrow", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const built = new Date(all.generatedAt);
  const nextDay = lagosDay(new Date(built.getTime() + 24 * 3_600_000).toISOString());
  const tomorrow = all.showings.map((s) => s.startsAt).filter((at) => lagosDay(at) === nextDay).sort().map(lagosClock);
  expect(tomorrow.length).toBeGreaterThan(200);
  await freeze(page, built);
  await page.goto("/");

  const sections = await page.locator('[data-testid^="section."]').evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")));
  expect(sections.at(-1)).toBe("section.tomorrow");
  expect(sections).toEqual(["section.soon", "section.later", "section.tomorrow"].filter((s) => sections.includes(s)));
  const section = page.getByTestId("section.tomorrow");
  await expect(section.getByRole("heading")).toHaveText(/^(Tomorrow|Today)$/);
  expect(await section.getByTestId("showing.time").allTextContents()).toEqual(tomorrow);
});

// The site holds only sample data, which can never be booked. To run the real booking path, this
// test rewrites the page on its way to the browser into live data with a booking link.
test("a live showing can be booked until the second it starts, then it is gone with its link", async ({ page, request }) => {
  const now = await sampleTime(request, "18:00");
  const first = startingSoon(await dataFile(request, "area/victoria-island"), now)[0]!;
  const readAt = new Date(now.getTime() - 3_600_000).toISOString().replace(".000Z", "Z");
  await page.route("**/area/victoria-island", async (route) => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace(/(fetchedAt\\?":\\?")[0-9T:Z-]+/g, `$1${readAt}`)
      .replace(/(method\\?":\\?")fixture/g, "$1public-page")
      .replace(/(sample\\?":)true/g, "$1false")
      .replace(/(book\\?":)null/g, '$1\\"https://www.filmhouseng.com/\\"');
    await route.fulfill({ response, body });
  });
  await freeze(page, new Date(Date.parse(first) - 60_000));
  await page.goto("/area/victoria-island");

  const row = page.locator(`[data-testid^="showing.row."][data-testid$="${first}"]`).first();
  await expect(row.getByTestId("showing.countdown")).toHaveText("Starts in 1 min");
  const book = row.getByTestId("showing.book");
  await expect(book).toHaveText("Book");
  await expect(book).toHaveAttribute("href", "https://www.filmhouseng.com/");
  await expect(book).toHaveAttribute("rel", "noopener");

  await page.clock.runFor(60_000);
  await expect(row).toHaveCount(0);
});
