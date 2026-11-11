import { utcMs } from "./lagos";
import { showingState, type ShowingState } from "./showingState";

const MIN = 60_000;

/** Whole minutes to the start (or since it), rounded down, with the showing's state. */
export function minutesFromStart(startsAt: string, now: string): { state: ShowingState; minutes: number } {
  return { state: showingState(startsAt, now), minutes: Math.floor(Math.abs(utcMs(startsAt) - utcMs(now)) / MIN) };
}

/**
 * "Starts in 1 h 20 min", "Starts in 45 min", "Starting now", "Started 5 min ago", or null once the
 * showing has ended. Minutes round down, so the wording never promises more time than there is.
 */
export function countdown(startsAt: string, now: string): string | null {
  const { state, minutes } = minutesFromStart(startsAt, now);
  if (state === "ended") return null;
  if (state === "started") return minutes === 0 ? "Started just now" : `Started ${minutes} min ago`;
  if (minutes === 0) return "Starting now";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `Starts in ${minutes} min`;
  return rest === 0 ? `Starts in ${hours} h` : `Starts in ${hours} h ${rest} min`;
}
