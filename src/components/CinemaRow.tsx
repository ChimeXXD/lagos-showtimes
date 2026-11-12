"use client";

import Link from "next/link";
import logos from "../../data/logos.json";
import { Heart } from "@/components/Icons";
import { byFilm, formatsOf } from "@/lib/data/programme";
import type { ListData, ListRow } from "@/lib/data/select";
import { toggleSaved } from "@/lib/saved";
import { formatTime } from "@/lib/time/lagos";
import { freshness, rowWarning } from "@/lib/wording/freshness";

const LOGOS: Record<string, { file: string; tile: string }> = logos.chains;

/** The chain's own logo on a tile (D-56), trimmed so the tile centres it; initials if there is none. */
export function ChainLogo({ chain, name }: { chain: string; name: string }) {
  const logo = LOGOS[chain];
  return logo ? (
    // The cinema's name follows, so the logo is not read out a second time.
    <span className={`vlogo ${logo.tile}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- a static export has no image optimiser */}
      <img src={`/logos/${logo.file}`} alt="" loading="lazy" decoding="async" />
    </span>
  ) : (
    <span className="vlogo light" aria-hidden="true">
      {name.slice(0, 2)}
    </span>
  );
}

const Play = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d="M3 1.600v8.800L10.400 6z" />
  </svg>
);

/**
 * One cinema on the Cinemas tab (D-56): logo, name, the next time and how many films, and tags.
 * The whole row opens the cinema; the heart keeps it under Your cinemas. `first` is true when the
 * first time is not "next" (tomorrow, or before the clock is known).
 */
export function CinemaRow({ cinema, rows, data, first, now, saved, areaName, testId }: { cinema: number; rows: ListRow[]; data: ListData; first: boolean; now: string | null; saved: boolean; /** Shown when the list mixes areas. */ areaName: string | null; testId: string }) {
  const info = data.cinemas[cinema]!;
  const films = byFilm(rows).length;
  const from = data.fresh[rows[0]!.fresh]!;
  const warning = now === null ? null : rowWarning(freshness({ name: from.source, method: from.method }, from.fetchedAt, now, from.via).band);
  return (
    <article className="vrow" data-testid={testId}>
      <ChainLogo chain={info.chain} name={info.name} />
      <div>
        <h3 className="vname" data-testid="cinema.name">
          {info.name}
        </h3>
        <p className="vnext" data-testid="cinema.next">
          <Play />
          {first ? "First" : "Next"} at <time dateTime={rows[0]!.at}>{formatTime(rows[0]!.at)}</time>{" "}
          <span>
            · {films} {films === 1 ? "film" : "films"}
            {areaName && ` · ${areaName}`}
          </span>
        </p>
        <div className="vtags">
          {formatsOf(rows).map((tag) => (
            <span key={tag} className="vtag fmt">
              {tag}
            </span>
          ))}
          <span className="vtag">{info.online ? "Book online" : "Tickets at the cinema"}</span>
          {warning && <span className="vtag old">{warning}</span>}
        </div>
      </div>
      <Link className="vopen" href={`/cinema/${info.id}`} aria-label={`${info.name}: films and times`} data-testid="cinema.open" />
      <button type="button" className="fav" data-testid="cinema.save" aria-pressed={saved} aria-label={`${saved ? "Remove" : "Keep"} ${info.name} ${saved ? "from" : "in"} your cinemas`} onClick={() => toggleSaved(info.id)}>
        <Heart on={saved} />
      </button>
    </article>
  );
}
