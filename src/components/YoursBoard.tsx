"use client";

import Link from "next/link";
import { Banner, sourceLine } from "@/components/Cards";
import { CinemaRow } from "@/components/CinemaRow";
import type { AreaInfo } from "@/components/Filters";
import { Heart } from "@/components/Icons";
import { byCinema, showingOn } from "@/lib/data/programme";
import type { ListData } from "@/lib/data/select";
import { useSaved } from "@/lib/saved";
import { useNow } from "@/lib/time/useNow";

/**
 * The Your cinemas tab (D-61): every cinema the visitor has hearted, at a glance, soonest first.
 * A kept cinema with nothing more today stays on the list and says so. The hearts are on the phone
 * only, so the list is drawn once the browser has taken over.
 */
export function YoursBoard({ data, areas }: { data: ListData; areas: AreaInfo[] }) {
  const clock = useNow();
  const saved = useSaved();
  const areaNames = Object.fromEntries(areas.map((area) => [area.slug, area.name]));
  // Until the clock is known nothing is listed: a kept cinema must not say "Nothing more today" by default.
  const today = clock === null ? [] : byCinema(showingOn(data.rows, 0, clock, null, false));
  const isKept = (cinema: number) => saved.includes(data.cinemas[cinema]!.id);
  const quiet = data.cinemas.flatMap((_, cinema) => (isKept(cinema) && !today.some((group) => group.cinema === cinema) ? [{ cinema, rows: [] }] : []));
  const kept = clock === null ? [] : [...today.filter((group) => isKept(group.cinema)), ...quiet];
  const fresh = [...new Set(kept.map((group) => (group.rows[0] ? sourceLine(data, group.rows[0], clock) : null)).filter((line): line is string => line !== null))];

  return (
    <>
      <div className="head">
        <div>
          <h1 className="title">Your cinemas</h1>
        </div>
      </div>
      <Banner data={data} now={clock} />
      {clock !== null && kept.length === 0 && (
        <div className="empty yours-empty" data-testid="yours.empty">
          <Heart on={false} />
          <p>
            <strong>Tap the heart on a cinema to keep it here.</strong>
          </p>
          <p>You&apos;ll see all your cinemas and their next times at a glance.</p>
          <Link className="btn" href="/cinemas" data-testid="yours.browse">
            See all cinemas
          </Link>
        </div>
      )}
      {kept.length > 0 && (
        <section className="vgroup" data-testid="saved">
          <div className="vhead">
            <h2>{kept.length === 1 ? "1 cinema" : `${kept.length} cinemas`}</h2>
            <span>soonest first · kept on this phone only</span>
          </div>
          {fresh.length > 0 && (
            <p className="vfresh" data-testid="fresh">
              {fresh.join(" · ")}
            </p>
          )}
          <div className="vgrid">
            {kept.map((group) => {
              const cinema = data.cinemas[group.cinema]!;
              return <CinemaRow key={cinema.id} cinema={group.cinema} rows={group.rows} data={data} first={false} now={clock} saved areaName={areaNames[cinema.area] ?? null} testId={`saved.row.${cinema.id}`} />;
            })}
          </div>
        </section>
      )}
    </>
  );
}
