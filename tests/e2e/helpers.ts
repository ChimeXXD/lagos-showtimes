import type { APIRequestContext, Page } from "@playwright/test";

// The built site runs on sample data dated the day it was built and the day after (D-20). Tests
// freeze the browser's clock on the day after, which always holds a full programme whatever time
// the build ran.

export type DataFile = {
  generatedAt: string;
  cinemas: { id: string; name: string; area: string }[];
  films: { id: string; title: string }[];
  showings: { cinemaId: string; filmId: string; startsAt: string; fetchedAt: string }[];
};

export async function dataFile(request: APIRequestContext, name: string): Promise<DataFile> {
  return (await (await request.get(`/data/${name}.json`)).json()) as DataFile;
}

/** The instant of `hh:mm` Lagos time on the sample data's second day. Lagos is UTC+1 all year. */
export async function sampleTime(request: APIRequestContext, hhmm: string): Promise<Date> {
  const { generatedAt } = await dataFile(request, "all");
  const lagosDay = new Date(Date.parse(generatedAt) + 3_600_000).toISOString().slice(0, 10);
  const nextDay = new Date(Date.parse(`${lagosDay}T00:00:00Z`) + 24 * 3_600_000).toISOString().slice(0, 10);
  return new Date(Date.parse(`${nextDay}T${hhmm}:00Z`) - 3_600_000);
}

/** Freezes the page's clock; call before `page.goto`. */
export async function freeze(page: Page, at: Date): Promise<void> {
  await page.clock.install({ time: at });
  await page.clock.pauseAt(at);
}

/** "19:30" in Lagos for a UTC instant. */
export const lagosClock = (iso: string) => new Date(Date.parse(iso) + 3_600_000).toISOString().slice(11, 16);

/** Start times (UTC) in an area that begin after `now` and no more than 2 hours later, in order. */
export function startingSoon(file: DataFile, now: Date): string[] {
  return file.showings
    .map((s) => s.startsAt)
    .filter((at) => Date.parse(at) > now.getTime() && Date.parse(at) - now.getTime() <= 2 * 3_600_000)
    .sort();
}

/** The Lagos calendar day, "2026-11-12", of a UTC instant. */
export const lagosDay = (iso: string) => new Date(Date.parse(iso) + 3_600_000).toISOString().slice(0, 10);
