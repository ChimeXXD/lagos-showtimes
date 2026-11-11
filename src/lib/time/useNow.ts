"use client";

import { useSyncExternalStore } from "react";
import { utcString } from "@/lib/time/lagos";

// The current time for relative words ("Starts in 45 min"), which are never baked into the page
// (CLAUDE.md rule 3). Null on the server and for the first render in the browser; after that it
// moves on every 30 s while the tab is visible and stops when it is hidden (SPEC §6). Ticks land
// on the clock's :00 and :30, so a showing leaves the list at its start, not up to 30 s after it
// (CLAUDE.md rule 4).

const TICK = 30_000;

let current: string | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function tick() {
  current = utcString(Date.now());
  for (const listener of listeners) listener();
  timer = setTimeout(tick, TICK - (Date.now() % TICK));
}
function onVisibility() {
  clearTimeout(timer);
  if (document.visibilityState === "visible") tick();
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
}

/** A UTC string to the second, or null before the browser has taken over the page. */
export function useNow(): string | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
