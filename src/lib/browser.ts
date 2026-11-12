"use client";

import { useState, useSyncExternalStore } from "react";
import { AREA_KEY } from "@/lib/area";

// Small readings from the browser that the page's own HTML cannot know: the saved area, and what
// follows # and ? in the address. Each is empty on the server and until the browser takes over.

const noop = () => () => {};
function onAddressChange(listener: () => void): () => void {
  window.addEventListener("hashchange", listener);
  window.addEventListener("popstate", listener);
  return () => {
    window.removeEventListener("hashchange", listener);
    window.removeEventListener("popstate", listener);
  };
}

/** The area saved on this phone, or null. */
export function useSavedArea(): string | null {
  return useSyncExternalStore(
    noop,
    () => {
      try {
        return localStorage.getItem(AREA_KEY);
      } catch {
        return null; // storage can be switched off
      }
    },
    () => null,
  );
}

/**
 * The area a page filters by: the visitor's saved one until they pick another here. Null is all
 * of Lagos. Picking here does not change the saved area.
 */
export function useAreaChoice(areas: { slug: string }[]): [string | null, (slug: string | null) => void] {
  const kept = useSavedArea();
  // `undefined` means not chosen on this page yet.
  const [chosen, setChosen] = useState<string | null | undefined>(undefined);
  return [chosen !== undefined ? chosen : kept && areas.some((area) => area.slug === kept) ? kept : null, setChosen];
}

function readHash(): string {
  try {
    return decodeURIComponent(window.location.hash);
  } catch {
    return window.location.hash; // a broken % in the address: not one of our links, and no reason to fail
  }
}

/** What follows # in the address, decoded, with the #. */
export function useHash(): string {
  return useSyncExternalStore(onAddressChange, readHash, () => "");
}

/**
 * True when a click on a <dialog> fell on its backdrop. A click on the dialog's own padding also
 * has the dialog as its target, so the point is checked against the dialog's box.
 */
export function onBackdrop(event: { target: EventTarget; currentTarget: HTMLDialogElement; clientX: number; clientY: number }): boolean {
  if (event.target !== event.currentTarget) return false;
  const box = event.currentTarget.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
}

/** One value from the address's query string, or null. */
export function useQuery(name: string): string | null {
  return useSyncExternalStore(onAddressChange, () => new URLSearchParams(window.location.search).get(name), () => null);
}
