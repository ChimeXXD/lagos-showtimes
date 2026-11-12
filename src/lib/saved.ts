"use client";

import { useSyncExternalStore } from "react";

// "Your cinemas": the ids a visitor has hearted, kept on this phone only.

const KEY = "ls.cinemas";
const listeners = new Set<() => void>();
const EMPTY: string[] = [];
let cache: { raw: string | null; ids: string[] } = { raw: null, ids: EMPTY };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY; // storage can be switched off
  }
  if (raw === cache.raw) return cache.ids;
  let ids: string[] = EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed)) ids = parsed.filter((id): id is string => typeof id === "string");
  } catch {
    // not a list: treat as none saved
  }
  cache = { raw, ids };
  return ids;
}

/** Adds the cinema, or removes it when it is already saved. */
export function toggleSaved(id: string): void {
  const ids = read();
  const next = ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return;
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The saved cinema ids; empty on the server and until the browser has taken over. */
export function useSaved(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
