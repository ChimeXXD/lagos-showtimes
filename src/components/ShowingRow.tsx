import Link from "next/link";
import type { ListData, ListRow } from "@/lib/data/select";
import { countdown } from "@/lib/time/countdown";
import { formatDate, formatDay, formatLateTime, formatTime } from "@/lib/time/lagos";
import { freshness } from "@/lib/wording/freshness";
import { showingSentence } from "@/lib/wording/showing";

const CAPSULE = "inline-flex min-h-11 min-w-28 items-center justify-center rounded-chip px-4 text-body font-semibold";

/**
 * One showing (UI brief §4.1, direction B): poster tile, time, countdown, film, cinema, where the
 * time came from, and the way to book. With `now` null (the page's own HTML, before the browser
 * takes over) it shows the date and time only: nothing relative and nothing to book.
 */
export function ShowingRow({ row, data, now, section }: { row: ListRow; data: ListData; now: string | null; section: "soon" | "later" | "tomorrow" | "all" }) {
  const film = data.films[row.film]!;
  const cinema = data.cinemas[row.cinema]!;
  const from = data.fresh[row.fresh]!;
  const source = { name: from.source, method: from.method };
  // Sample wording does not depend on the clock, so it can be in the page's own HTML.
  const fresh = now !== null || from.method === "fixture" ? freshness(source, from.fetchedAt, now ?? from.fetchedAt, from.via) : null;
  const sentence = now !== null && fresh ? showingSentence({ film: film.title, cinema: cinema.name, startsAt: row.at, freshness: fresh.text }, now) : null;
  const beside = now === null ? formatDate(row.at) : section === "tomorrow" ? formatDay(row.at, now) : countdown(row.at, now);
  // After midnight a row sits under the evening before, so its time names its own day: "00:30 (Sat)".
  const time = section === "later" || section === "tomorrow" ? formatLateTime(row.at) : formatTime(row.at);
  // The name and the link are always the same site: the cinema's own when we have its address.
  const check = from.via?.url ? { name: from.via.name, url: from.via.url } : { name: from.source, url: from.url };
  // The sentence carries the row for screen readers; the pieces it repeats are then hidden from them.
  const spoken = sentence !== null;

  return (
    <li data-testid={`showing.row.${cinema.id}_${film.id}_${row.at}`} className="grid grid-cols-[76px_1fr] gap-x-3">
      <div aria-hidden="true" className="flex h-[114px] w-[76px] items-end overflow-hidden rounded-poster border border-line bg-poster p-1.5 text-[10px] leading-[1.15] font-semibold text-poster-text">
        {film.title}
      </div>
      <div className="grid min-w-0 content-start gap-1.5">
        {spoken && <span className="sr-only">{sentence}</span>}
        <div aria-hidden={spoken} className="flex flex-wrap items-center gap-2">
          <time dateTime={row.at} data-testid="showing.time" className="text-time font-semibold tabular-nums">
            {time}
          </time>
          {beside && (
            <span data-testid="showing.countdown" className="rounded-chip bg-surface px-2 py-[3px] text-fresh font-medium whitespace-nowrap">
              {beside}
            </span>
          )}
        </div>
        <div className="grid gap-0.5">
          <Link href={`/film/${film.id}`} data-testid="showing.film" className="text-title font-semibold">
            {film.title}
          </Link>
          <span aria-hidden={spoken} data-testid="showing.meta" className="text-meta text-text-muted">
            {cinema.name}
            {row.format ? ` · ${row.format}` : ""}
          </span>
          {fresh && (
            <span aria-hidden={spoken} data-testid="showing.freshness" className={`text-fresh ${fresh.band === "stale" || fresh.band === "old" ? "text-stale" : "text-text-muted"}`}>
              {fresh.text}
            </span>
          )}
        </div>
        {now !== null && fresh && (
          <div className="mt-0.5 flex items-center">
            {fresh.band === "sample" ? (
              <span data-testid="showing.sample" className={`${CAPSULE} border border-line text-text-muted`}>
                Sample only
              </span>
            ) : !fresh.bookable ? (
              <a href={check.url} target="_blank" rel="noopener" data-testid="showing.check" className={`${CAPSULE} border border-line`}>
                Check on {check.name}
              </a>
            ) : row.book ? (
              <a href={row.book} target="_blank" rel="noopener" data-testid="showing.book" aria-label={`Book ${film.title} at ${cinema.name}, ${time}`} className={`${CAPSULE} bg-book text-book-text`}>
                Book
              </a>
            ) : (
              <span data-testid="showing.at-cinema" className="flex min-h-11 items-center text-meta text-text-muted">
                Tickets at the cinema
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
