"use client";

import Link from "next/link";
import { Poster } from "@/components/Poster";
import { TimeChip } from "@/components/Showing";
import { formatsOf } from "@/lib/data/programme";
import { bannerFor, type ListData, type ListRow } from "@/lib/data/select";
import { minutesFromStart } from "@/lib/time/countdown";
import { filmMeta, shortCountdown } from "@/lib/wording/film";
import { freshness } from "@/lib/wording/freshness";

/** Where a cinema's times came from, in words. Sample wording needs no clock. */
export function sourceLine(data: ListData, row: ListRow, now: string | null): string | null {
  const from = data.fresh[row.fresh]!;
  if (now === null && from.method !== "fixture") return null;
  return freshness({ name: from.source, method: from.method }, from.fetchedAt, now ?? from.fetchedAt, from.via).text;
}

/** The one notice a page shows: sample data, or times that are a day old or older. */
export function Banner({ data, now }: { data: ListData; now: string | null }) {
  const bands = data.sample ? (["sample"] as const) : now === null ? [] : data.fresh.map((from) => freshness({ name: from.source, method: from.method }, from.fetchedAt, now, from.via).band);
  const banner = bannerFor([...bands]);
  return banner ? (
    <p role="status" className="banner" data-testid={`banner.${banner.kind}`}>
      {banner.text}
    </p>
  ) : null;
}

const Times = ({ rows, data, max }: { rows: ListRow[]; data: ListData; max: number }) => (
  <div className="times">
    {rows.slice(0, max).map((row) => (
      <TimeChip key={row.at} row={row} data={data} />
    ))}
    {rows.length > max && <span className="t more">+{rows.length - max}</span>}
  </div>
);

/** A film as a poster card. `extra` goes under the title: times at one cinema, or where it is on. */
export function FilmCard({ film, rows, now, index, children }: { film: ListData["films"][number]; rows: ListRow[]; now: string | null; index: number; children?: React.ReactNode }) {
  const formats = formatsOf(rows);
  const first = rows[0];
  const soon = now !== null && first ? minutesFromStart(first.at, now) : null;
  return (
    <article className="pcard" data-testid={`film.card.${film.id}`} style={{ "--i": Math.min(index, 10) } as React.CSSProperties}>
      <Link className="pwrap" href={`/film/${film.id}`} aria-label={film.title}>
        <Poster film={film} />
        {formats.length > 0 && <span className="badge">{formats.join(" · ")}</span>}
        {soon && soon.state !== "started" && soon.state !== "ended" && soon.minutes <= 60 && first && now && <span className="soon">Starts {shortCountdown(first.at, now)}</span>}
      </Link>
      <h3 className="ptitle">
        <Link href={`/film/${film.id}`}>{film.title}</Link>
      </h3>
      <p className="pmeta">{filmMeta(film)}</p>
      {children}
    </article>
  );
}

export { Times };
