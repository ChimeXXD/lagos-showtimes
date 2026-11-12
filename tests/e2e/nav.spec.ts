import { expect, test } from "@playwright/test";
import { freeze, sampleTime } from "./helpers";

// Chime's review, 12 Nov 2026 (D-55): Films comes first. A visitor has a film in mind, picks it, then
// sees every cinema showing it.
test("the site opens on Films, and the tabs read Films, Cinemas, Starting soon on every page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Films in Lagos");
  await expect(page.getByTestId("tab.films")).toHaveAttribute("aria-current", "page");
  for (const path of ["/", "/cinemas", "/area/lekki", "/soon", "/film/ramayana", "/cinema/ebonylife-vi"]) {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "Sections" }).getByRole("link")).toHaveText(["Films", "Cinemas", "Starting soon"]);
  }
  await page.getByTestId("tab.cinemas").click();
  await expect(page).toHaveURL(/\/cinemas$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cinemas in Lagos");
});

test("a saved area takes the Cinemas tab to that area, not the Films home", async ({ page }) => {
  await page.goto("/cinemas");
  await page.getByTestId("pick.area").click();
  await page.getByTestId("sheet.area.ikeja").click();
  await expect(page).toHaveURL(/\/area\/ikeja$/);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Films in Lagos");
  await page.getByTestId("tab.cinemas").click();
  await expect(page).toHaveURL(/\/area\/ikeja$/);
});

test("on a phone, the search button opens a search box on the page it is on, and a match opens the film", async ({ page, request }) => {
  await freeze(page, await sampleTime(request, "18:00"));
  await page.goto("/soon");
  const box = page.getByTestId("search.input");
  await expect(box).toBeHidden();
  await page.getByTestId("search.open").click();
  await expect(page).toHaveURL(/\/soon$/); // it does not jump to another page
  await expect(box).toBeVisible();
  await expect(box).toBeFocused();
  await box.fill("spider");
  const hits = page.getByTestId("search.results").getByRole("link");
  await expect(hits).toHaveText(["Spider-Man: Brand New Day"]);
  await hits.first().click();
  await expect(page).toHaveURL(/\/film\/spider-man-brand-new-day$/);
});

test("search says so when no film matches, and Escape closes it", async ({ page }) => {
  await page.goto("/cinemas");
  await page.getByTestId("search.open").click();
  await page.getByTestId("search.input").fill("zzz");
  await expect(page.getByTestId("search.none")).toHaveText('No film showing matches "zzz".');
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("search.input")).toBeHidden();
  await expect(page.getByTestId("search.open")).toBeFocused();
  // The search button opens and closes it.
  await page.getByTestId("search.open").click();
  await expect(page.getByTestId("search.input")).toBeVisible();
  await page.getByTestId("search.open").click();
  await expect(page.getByTestId("search.input")).toBeHidden();
});

for (const width of [390, 360, 320]) {
  test(`at ${width} px every area chip is whole on screen, none cut off or covered`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/film/ramayana"); // the Cinemas tab uses pickers on a phone since D-56; a film's page still has chips
    const chips = page.locator('[data-testid^="area.chip."], [data-testid="area.more"]');
    await expect(chips).toHaveCount(5); // three areas, All Lagos, More areas
    const cut = await chips.evaluateAll((els) =>
      els.filter((el) => {
        // On a film's page the chips sit low; bring each into view first, or a point below the
        // window reads as "covered" (it did in CI, where the font sets a little wider).
        el.scrollIntoView({ block: "center" });
        const box = el.getBoundingClientRect();
        if (box.left < 0 || box.right > window.innerWidth) return true;
        // The middle of each edge (2 px in; the corners are rounded off) must be this chip, not
        // something drawn over it or a scrolling row's clipped edge.
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        return [[box.left + 2, y], [box.right - 2, y], [x, box.top + 2], [x, box.bottom - 2]].some(([px, py]) => !el.contains(document.elementFromPoint(px!, py!)));
      }).map((el) => el.getAttribute("data-testid")),
    );
    expect(cut).toEqual([]);
  });
}

for (const width of [360, 320]) {
  test(`at ${width} px each tab name stays on one line`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    // A wrapped name still fits in the 44 px tab, so count the lines of text, not the tab's height.
    const wrapped = await page.getByRole("navigation", { name: "Sections" }).getByRole("link").evaluateAll((els) =>
      els.filter((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size > 1;
      }).map((el) => el.textContent),
    );
    expect(wrapped).toEqual([]);
  });
}
