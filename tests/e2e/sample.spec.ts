import { expect, test } from "@playwright/test";
import { freeze, sampleTime } from "./helpers";

// SPEC §8, check 9: with fixtures active, every page says so and nothing can be booked.
for (const path of ["/", "/area/lekki", "/film/spider-man-brand-new-day"]) {
  test(`${path} shows the Sample data banner and no booking link`, async ({ page, request }) => {
    await freeze(page, await sampleTime(request, "18:00"));
    await page.goto(path);
    await expect(page.getByTestId("banner.sample")).toHaveText("Sample data. These times are for the demo, not for booking.");
    expect(await page.locator('[data-testid^="showing.row."]').count()).toBeGreaterThan(0);
    await expect(page.getByTestId("showing.book")).toHaveCount(0);
    await expect(page.getByTestId("showing.sample").first()).toHaveText("Sample only");
    await expect(page.locator('a[href*="filmhouseng"], a[href*="genesiscinemas"], a[href*="veezi"], a[href*="ebonylifecinemas"]')).toHaveCount(0);
  });
}

test("the banner is in the page's own HTML, before any script runs", async ({ request }) => {
  const html = await (await request.get("/area/lekki")).text();
  expect(html.replace(/<script[\s\S]*?<\/script>/g, "")).toContain("Sample data. These times are for the demo, not for booking.");
});
