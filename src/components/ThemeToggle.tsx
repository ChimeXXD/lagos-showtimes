"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "@/components/Icons";
import { THEME_KEY } from "@/lib/area";

type Theme = "light" | "dark";
const CHANGED = "sinima:theme";

function subscribe(listener: () => void): () => void {
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", listener);
  window.addEventListener(CHANGED, listener);
  return () => {
    scheme.removeEventListener("change", listener);
    window.removeEventListener(CHANGED, listener);
  };
}
/** The theme on screen: the one chosen here, or the phone's own. */
function current(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
/** The browser bar takes the page colour: both theme-color tags, since a choice here outranks the media query. */
function paintBar(theme: Theme | null, bg: { light: string; dark: string }) {
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = theme ? bg[theme] : meta.media.includes("dark") ? bg.dark : bg.light;
  });
}

/**
 * The light and dark switch in the header (D-58). It follows the phone until tapped, then keeps the
 * choice on this device; layout.tsx applies a kept choice before the page is drawn.
 */
export function ThemeToggle({ bg }: { bg: { light: string; dark: string } }) {
  const theme = useSyncExternalStore(subscribe, current, () => null);
  useEffect(() => {
    const chosen = document.documentElement.dataset.theme;
    paintBar(chosen === "light" || chosen === "dark" ? chosen : null, bg);
  }, [bg]);

  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="round theme"
      data-testid="theme.toggle"
      aria-label={theme ? `Switch to ${next} mode` : "Switch between light and dark mode"}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {
          // Storage can be switched off: the choice holds until the page is left.
        }
        paintBar(next, bg);
        window.dispatchEvent(new Event(CHANGED));
      }}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}
