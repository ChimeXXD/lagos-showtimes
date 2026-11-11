"use client";

import Link from "next/link";
import { ShowingRow } from "@/components/ShowingRow";
import { bannerFor, groupShowings, laterName, nextDayName, soonCount, type ListData, type ListRow } from "@/lib/data/select";
import { useNow } from "@/lib/time/useNow";
import { freshness, type FreshnessBand } from "@/lib/wording/freshness";

export type Neighbour = { slug: string; name: string; starts: string[] };

const SECTIONS = ["soon", "later", "tomorrow"] as const;

function Rows({ rows, data, now, section }: { rows: ListRow[]; data: ListData; now: string | null; section: "soon" | "later" | "tomorrow" | "all" }) {
  return (
    <ul className="grid gap-6 px-4">
      {rows.map((row) => (
        <ShowingRow key={`${row.cinema}_${row.film}_${row.at}`} row={row} data={data} now={now} section={section} />
      ))}
    </ul>
  );
}

/**
 * The showings on a page. The page's own HTML holds every row in time order with absolute times;
 * once the browser has the time, the rows regroup into Starting soon, Later tonight and Tomorrow,
 * and showings that have started drop out (D-05, D-18).
 */
export function ShowingsBoard({ data, place, neighbours = [] }: { data: ListData; place: string; neighbours?: Neighbour[] }) {
  const now = useNow();
  // A sample file says so even when it has no rows to read a band from (CLAUDE.md rule 8).
  const bands: FreshnessBand[] = data.sample ? ["sample"] : [];
  if (now !== null) for (const from of data.fresh) bands.push(freshness({ name: from.source, method: from.method }, from.fetchedAt, now, from.via).band);
  const banner = bannerFor(bands);
  const groups = now === null ? null : groupShowings(data.rows, now);
  const later = now === null ? "" : laterName(now);
  const heads = { soon: ["Starting soon", "next 2 hours"], later: [later, later === "Later tonight" ? "until 04:00" : ""], tomorrow: [now === null ? "" : nextDayName(now), ""] };

  return (
    <>
      {banner && (
        <p role="status" data-testid={`banner.${banner.kind}`} className="mx-4 mb-2 rounded-sheet bg-surface p-3 text-meta">
          {banner.text}
        </p>
      )}
      {groups === null || now === null ? (
        <section data-testid="section.all">
          <h2 className="mx-4 mt-6 mb-2 text-section font-semibold">All showings</h2>
          <Rows rows={data.rows} data={data} now={null} section="all" />
        </section>
      ) : (
        <>
          {groups.soon.length === 0 && (
            <div data-testid="empty.soon" className="mx-4 mt-4 grid gap-2 rounded-card bg-surface p-4">
              <p>
                Nothing starts in the next 2 hours in {place}.
                {groups.later.length > 0 ? ` Here's ${later.toLowerCase()}.` : groups.tomorrow.length > 0 ? " Here's tomorrow." : ""}
              </p>
              {neighbours.length > 0 && (
                <ul className="flex flex-wrap items-center gap-2" aria-label="Areas nearby">
                  <li aria-hidden="true" className="text-meta text-text-muted">
                    Nearby
                  </li>
                  {neighbours.map((neighbour) => {
                    const count = soonCount(neighbour.starts, now);
                    return (
                      <li key={neighbour.slug}>
                        <Link href={`/area/${neighbour.slug}`} data-testid={`empty.neighbour.${neighbour.slug}`} className="inline-flex min-h-11 items-center rounded-chip border border-line bg-bg px-3.5 text-meta font-semibold">
                          {neighbour.name} · {count > 0 ? `${count} starting soon` : "nothing soon"}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
          {SECTIONS.map((key) => {
            const [title, sub] = heads[key];
            return groups[key].length === 0 ? null : (
              <section key={key} data-testid={`section.${key}`}>
                <div className="mx-4 mt-6 mb-2 flex items-baseline gap-2">
                  <h2 className="text-section font-semibold">{title}</h2>
                  {sub && <span className="text-meta text-text-muted">{sub}</span>}
                </div>
                <Rows rows={groups[key]} data={data} now={now} section={key} />
              </section>
            );
          })}
        </>
      )}
    </>
  );
}
