"use client";

import { useEffect, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { Icon } from "@/components/Icons";
import { THEME_KEY } from "@/lib/area";

type Theme = "light" | "dark";
const CHANGED = "sinima:theme";
/** The switch's view transition in flight, so an older one ending cannot take the circle off a newer one. */
let wipe: ViewTransition | undefined;

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
  const apply = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage can be switched off: the choice holds until the page is left.
    }
    paintBar(next, bg);
    // Inside a view transition the new look must be on the page before the callback returns.
    flushSync(() => window.dispatchEvent(new Event(CHANGED)));
  };
  return (
    <button
      type="button"
      className="round theme"
      data-testid="theme.toggle"
      aria-label={theme ? `Switch to ${next} mode` : "Switch between light and dark mode"}
      onClick={(event) => {
        // The new theme opens out in a circle from the switch. A browser without view transitions
        // switches at once; with reduced motion the browser's own cross-fade plays instead.
        if (!document.startViewTransition) return apply();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const box = event.currentTarget.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        const root = document.documentElement;
        if (!reduce) root.classList.add("theme-wipe");
        const transition = (wipe = document.startViewTransition(apply));
        // A second tap skips this transition, which rejects its promises: that is expected, not an error.
        transition.finished.catch(() => {}).finally(() => {
          if (wipe === transition) root.classList.remove("theme-wipe");
        });
        if (reduce) return;
        transition.ready.then(
          () => root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, { duration: 400, easing: "cubic-bezier(0.23, 1, 0.32, 1)", pseudoElement: "::view-transition-new(root)" }),
          () => {},
        );
      }}
    >
      {/* Both icons are drawn; the stylesheet shows the one for the other theme, turning it in as the other turns away. */}
      <span className="sun">
        <Icon name="sun" />
      </span>
      <span className="moon">
        <Icon name="moon" />
      </span>
    </button>
  );
}
