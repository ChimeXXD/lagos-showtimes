import { expect, test } from "@playwright/test";

test("the built site serves the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Sinima" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en-NG");
});
