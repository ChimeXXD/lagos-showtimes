import { expect, test } from "@playwright/test";
import registry from "../../data/cinemas.json" with { type: "json" };
import { dataFile, freeze, sampleTime, startingSoon } from "./helpers";

// SPEC §8, check 12 (D-22).
test("an area with nothing in the next 2 hours offers its neighbouring areas with counts", async ({ page, request }) => {
  // Find a time on the sample day when some area has nothing soon but a neighbour does.
  let found: { slug: string; name: string; now: Date; neighbours: { slug: string; name: string; count: number }[] } | undefined;
  const files = new Map(await Promise.all(registry.areas.map(async (a) => [a.slug, await dataFile(request, `area/${a.slug}`)] as const)));
  search: for (const hhmm of ["08:30", "09:30", "10:30", "21:00", "21:30", "22:00", "22:30"]) {
    const now = await sampleTime(request, hhmm);
    for (const area of registry.areas) {
      if (startingSoon(files.get(area.slug)!, now).length > 0) continue;
      const neighbours = area.neighbours.map((slug) => ({
        slug,
        name: registry.areas.find((a) => a.slug === slug)!.name,
        count: startingSoon(files.get(slug)!, now).length,
      }));
      if (neighbours.some((n) => n.count > 0)) {
        found = { slug: area.slug, name: area.name, now, neighbours };
        break search;
      }
    }
  }
  expect(found, "no area was empty with a busy neighbour at any tried time").toBeDefined();
  const { slug, name, now, neighbours } = found!;

  await freeze(page, now);
  await page.goto(`/area/${slug}`);
  await expect(page.getByTestId("section.soon")).toHaveCount(0);
  const empty = page.getByTestId("empty.soon");
  await expect(empty).toContainText(`Nothing starts in the next 2 hours in ${name}.`);
  for (const n of neighbours) {
    await expect(page.getByTestId(`empty.neighbour.${n.slug}`)).toHaveText(n.count > 0 ? `${n.name} · ${n.count} starting soon` : `${n.name} · nothing soon`);
  }
  await expect(empty).not.toContainText(/\bkm\b|\bmin away\b|minutes away/);

  const busy = neighbours.find((n) => n.count > 0)!;
  await page.getByTestId(`empty.neighbour.${busy.slug}`).click();
  await expect(page).toHaveURL(new RegExp(`/area/${busy.slug}$`));
  // Looking at a neighbour does not change the saved area.
  expect(await page.evaluate(() => localStorage.getItem("ls.area"))).toBeNull();
});
