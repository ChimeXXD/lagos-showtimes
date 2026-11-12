"use client";

import Link from "next/link";
import { useSavedArea } from "@/lib/browser";

// Films first (D-55): a visitor has a film in mind, picks it, then sees every cinema showing it.
const TABS = [
  ["films", "Films", "/"],
  ["cinemas", "Cinemas", "/cinemas"],
  ["soon", "Starting soon", "/soon"],
] as const;

export type TabId = (typeof TABS)[number][0];

/** The three ways in. Cinemas goes straight to the saved area's cinemas, if there is one (D-18). */
export function Tabs({ tab, areas }: { tab: TabId; areas: string[] }) {
  const saved = useSavedArea();
  const area = saved && areas.includes(saved) ? saved : null;
  return (
    <nav className="tabs" aria-label="Sections">
      {TABS.map(([id, label, href]) => (
        <Link key={id} href={id === "cinemas" && area ? `/area/${area}` : href} className={id === tab ? "tab on" : "tab"} aria-current={id === tab ? "page" : undefined} data-testid={`tab.${id}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
