"use client";

import Link from "next/link";
import { useState } from "react";
import { filmCounts, type ListData } from "@/lib/data/select";
import { useNow } from "@/lib/time/useNow";

/**
 * "Now showing": every film on the page's data, with a filter-as-you-type box (D-22). Once the
 * browser has the time, a film counts only the showings still to start.
 */
export function FilmList({ data }: { data: ListData }) {
  const films = filmCounts(data, useNow());
  const [query, setQuery] = useState("");
  const wanted = query.trim().toLowerCase();
  const shown = wanted === "" ? films : films.filter((film) => film.title.toLowerCase().includes(wanted));
  // Nothing showing at all: no list and no box to filter it with.
  if (films.length === 0) return null;

  return (
    <section className="mx-4 mt-8" aria-labelledby="films-title">
      <h2 id="films-title" className="text-section font-semibold">
        Now showing
      </h2>
      <label className="mt-2 block">
        <span className="sr-only">Find a film by its title</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a film"
          autoComplete="off"
          data-testid="films.filter"
          className="min-h-12 w-full rounded-chip border border-line bg-surface px-4 text-body placeholder:text-text-muted"
        />
      </label>
      <ul className="mt-2">
        {shown.map((film) => (
          <li key={film.id}>
            <Link href={`/film/${film.id}`} data-testid={`films.item.${film.id}`} className="flex min-h-12 items-center justify-between gap-3 border-b border-line">
              <span className="font-semibold">{film.title}</span>
              <span className="shrink-0 text-meta text-text-muted">
                {film.showings} {film.showings === 1 ? "showing" : "showings"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p data-testid="films.none" className="mt-3 text-text-muted">
          No film showing matches &quot;{query.trim()}&quot;.
        </p>
      )}
    </section>
  );
}
