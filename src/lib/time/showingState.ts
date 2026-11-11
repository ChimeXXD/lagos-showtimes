import { utcMs } from "./lagos";

// Where a showing is in its life (D-05). Computed in the browser from `now`, never baked into HTML.
export type ShowingState = "upcoming" | "starting" | "started" | "ended";

const MIN = 60_000;
const STARTING_WINDOW = 10 * MIN;
const STARTED_WINDOW = 30 * MIN;

/**
 * upcoming: more than 10 min ahead. starting: 10 min or less ahead. started: from the start instant
 * to 30 min after. ended: later than that (hidden).
 */
export function showingState(startsAt: string, now: string): ShowingState {
  const ahead = utcMs(startsAt) - utcMs(now);
  if (ahead > STARTING_WINDOW) return "upcoming";
  if (ahead > 0) return "starting";
  if (ahead >= -STARTED_WINDOW) return "started";
  return "ended";
}

/** Booking is only ever offered before the start; freshness can still take it away (DATA §Freshness). */
export function isBeforeStart(state: ShowingState): boolean {
  return state === "upcoming" || state === "starting";
}
