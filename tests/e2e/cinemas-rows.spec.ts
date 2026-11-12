import { expect, test } from "@playwright/test";
import { cinemasBySoonest, dataFile, freeze, lagosClock, sampleTime, today } from "./helpers";

// The Cinemas tab as logo rows (D-56), after Chime's Instacart picks.
test("each cinema is one row with its chain's logo, name, next time and tags, soonest first; no poster strips", async ({ page, request }) => {
  const all = await dataFile(request, "all");
  const now = await sampleTime(request, "18:00");
  const rows = today(all, now);
  const expected = cinemasBySoonest(rows);
  await freeze(page, now);
  await page.goto("/cinemas");

  const cards = page.getByTestId("group.all").locator('[data-testid^="cinema.card."]');
  expect(await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.replace("cinema.card.", "")))).toEqual(expected);
  await expect(page.locator(".strip, .ccard")).toHaveCount(0);

  const first = expected[0]!;
  const card = page.getByTestId(`cinema.card.${first}`);
  const films = new Set(rows.filter((s) => s.cinemaId === first).map((s) => s.filmId)).size;
  await expect(card.getByTestId("cinema.next")).toHaveText(new RegExp(`^Next at ${lagosClock(rows.find((s) => s.cinemaId === first)!.startsAt)} · ${films} films? · `));
  await card.getByTestId("cinema.open").click();
  await expect(page).toHaveURL(new RegExp(`/cinema/${first}$`));
});

test("every logo loads and sits in the centre of its tile", async ({ page, request }) => {
  await freeze(page, await sampleTime(request, "10:00"));
  await page.goto("/cinemas");
  const tiles = page.locator(".vlogo");
  expect(await tiles.count()).toBeGreaterThan(10);
  const off = await tiles.evaluateAll(async (els) => {
    const bad: string[] = [];
    for (const tile of els) {
      tile.scrollIntoView();
      const img = tile.querySelector("img")!;
      await img.decode().catch(() => bad.push(`${img.getAttribute("src")}: did not load`));
      const a = tile.getBoundingClientRect(), b = img.getBoundingClientRect();
      const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) bad.push(`${img.getAttribute("src")}: ${dx.toFixed(1)}, ${dy.toFixed(1)}`);
    }
    return bad;
  });
  expect(off).toEqual([]);
});

test("where the times came from is said once, under the first list heading", async ({ page, request }) => {
  await freeze(page, await sampleTime(request, "18:00"));
  await page.goto("/cinemas");
  await expect(page.getByTestId("fresh")).toHaveCount(1);
  await expect(page.getByTestId("group.all").getByTestId("fresh")).toHaveText("Sample data saved from Lagocine on 11 Nov");
});

for (const width of [390, 360, 320]) {
  test(`at ${width} px the filters are one row of three pickers, whole on screen`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/cinemas");
    const pickers = page.locator('[data-testid^="pick."]');
    await expect(pickers).toHaveCount(3);
    const boxes = await pickers.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()).map((r) => ({ top: Math.round(r.top), left: r.left, right: r.right, height: r.height })));
    expect(new Set(boxes.map((b) => b.top)).size).toBe(1);
    for (const b of boxes) {
      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(width);
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByTestId("area.chip.all")).toBeHidden(); // the desktop chips are not on a phone
  });
}

test("the day picker opens a sheet; Tomorrow shows tomorrow and the picker says so", async ({ page, request }) => {
  await freeze(page, new Date((await dataFile(request, "all")).generatedAt)); // the data's first day, so tomorrow has times
  await page.goto("/cinemas");
  await page.getByTestId("pick.day").click();
  const sheet = page.getByTestId("sheet.day");
  await expect(sheet).toBeVisible();
  await sheet.getByTestId("day.option.tomorrow").click();
  await expect(sheet).toBeHidden();
  await expect(page.getByTestId("pick.day")).toHaveText("Tomorrow");
  await expect(page.getByTestId("cinema.next").first()).toHaveText(/^First at /);
});

test("the footer says the logos are the chains' own and how to have one removed", async ({ page }) => {
  await page.goto("/cinemas");
  await expect(page.getByTestId("footer.logos")).toContainText("Cinema logos belong to their owners");
  await expect(page.getByTestId("footer.logos").getByRole("link")).toHaveAttribute("href", "https://github.com/ChimeXXD/sinima/issues");
});
