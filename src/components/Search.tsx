"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Icon } from "@/components/Icons";

export type SearchFilm = { id: string; title: string };

/**
 * Search a film from any page (D-55). On a computer the box sits in the header; on a phone the
 * search button opens it on the page you are on. Matches show as you type and open the film;
 * Enter shows every match on the Films home.
 */
export function Search({ films }: { films: SearchFilm[] }) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const wanted = query.trim().toLowerCase();
  const hits = wanted ? films.filter((film) => film.title.toLowerCase().includes(wanted)).slice(0, 6) : [];
  const close = () => {
    setOpen(false);
    setQuery("");
    button.current?.focus();
  };

  return (
    <>
      <form
        className={open ? "search open" : "search"}
        action="/"
        role="search"
        onFocus={() => setFocused(true)}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
        onKeyDown={(event) => { if (event.key === "Escape") close(); }}
      >
        <Icon name="search" />
        <input ref={input} type="search" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a film" aria-label="Search a film" autoComplete="off" data-testid="search.input" />
        <button type="button" className="shut" aria-label="Close search" onClick={close} data-testid="search.close">
          <Icon name="x" />
        </button>
        {focused && wanted ? (
          // Keep focus in the box while a match is pressed: a browser that does not focus links on click
          // (Safari) would otherwise blur the form and remove the list before the click lands.
          <div className="menu results" aria-live="polite" data-testid="search.results" onMouseDown={(event) => event.preventDefault()}>
            {hits.length === 0 ? (
              <p className="none" data-testid="search.none">No film showing matches &quot;{query.trim()}&quot;.</p>
            ) : (
              hits.map((film) => (
                <Link key={film.id} href={`/film/${film.id}`} data-testid={`search.hit.${film.id}`}>
                  {film.title}
                </Link>
              ))
            )}
          </div>
        ) : null}
      </form>
      <button
        ref={button}
        type="button"
        className="round"
        aria-label="Search a film"
        aria-expanded={open}
        data-testid="search.open"
        // Focus inside the tap itself: a phone only raises the keyboard for focus a tap asked for.
        onClick={() => {
          if (open) return close();
          flushSync(() => setOpen(true));
          input.current?.focus();
        }}
      >
        <Icon name="search" />
      </button>
    </>
  );
}
