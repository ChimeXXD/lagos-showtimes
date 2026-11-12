import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

// E2E runs against the built static site (out/) at a phone viewport.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // the Mac is tight on memory; one browser at a time
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: "en-NG",
    timezoneId: "Africa/Lagos",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "phone",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    // CI has already built out/ (with its secrets) and checked its budget: serve that same build.
    command: process.env.CI
      ? `node scripts/serve-out.mjs ${PORT}`
      : // Sample data as of 08:00 in Lagos today, so a build late in the evening still holds a full day
        // (`npm run build` would make it at the real hour, and the day's ended showings drop out).
        `node scripts/refresh.ts --fixtures --now ${new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date())}T07:00:00Z && npx --no-install next build && node scripts/serve-out.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
