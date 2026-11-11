import { expect, test } from "@playwright/test";

test("the built site serves the home page", async ({ page }) => {
  await page.goto("/");
  // The name is the header's wordmark; the page's heading says what the page is for.
  await expect(page.getByTestId("wordmark")).toHaveText("Sinima");
  await expect(page.getByRole("heading", { level: 1, name: "Starting soon in Lagos" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en-NG");
});
