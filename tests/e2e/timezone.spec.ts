import { expect, test } from "@playwright/test";
import { dataFile, freeze, lagosClock, sampleTime, startingSoon } from "./helpers";

// SPEC §8, check 6: Lagos time whatever zone the phone is in (D-06).
test.use({ timezoneId: "America/New_York" });

test("with the phone set to New York, times are still Lagos times", async ({ page, request }) => {
  const now = await sampleTime(request, "18:00");
  const expected = startingSoon(await dataFile(request, "area/lekki"), now).map(lagosClock);
  await freeze(page, now);
  await page.goto("/area/lekki");
  expect(await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone)).toBe("America/New_York");
  await expect(page.getByTestId("section.soon").getByTestId("showing.time")).toHaveText(expected);
});
