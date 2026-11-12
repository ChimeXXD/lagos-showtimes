"use client";

import { useState } from "react";
import { Banner, sourceLine } from "@/components/Cards";
import { CinemaRow } from "@/components/CinemaRow";
import { AreaChips, DayTabs, FormatChips, type AreaInfo } from "@/components/Filters";
import { Pickers } from "@/components/Pickers";
import type { FormatTag } from "@/lib/data/format";
import { byCinema, dayDates, formatsOf, showingOn, type Day } from "@/lib/data/programme";
import { dayWords } from "@/lib/wording/day";
import type { ListData, ListRow } from "@/lib/data/select";
import { useSaved } from "@/lib/saved";
import { useNow } from "@/lib/time/useNow";
import { list } from "@/lib/wording/credits";

type Group = { cinema: number; rows: ListRow[] };
// "Elsewhere in Lagos" on an area's page shows this many, then "Show all" (Instacart web, D-56).
const ELSEWHERE = 6;

/** The Cinemas tab (D-49, D-56): a row per cinema with its logo, soonest first. `area` is null for all of Lagos. */
export function CinemasBoard({ data, areas, area }: { data: ListData; areas: AreaInfo[]; area: string | null }) {
  const clock = useNow();
  const now = clock ?? data.at;
  const saved = useSaved();
  const [day, setDay] = useState<Day>(0);
  const [format, setFormat] = useState<FormatTag | null>(null);
  const [open, setOpen] = useState(false);

  const here = areas.find((candidate) => candidate.slug === area) ?? null;
  const areaNames = Object.fromEntries(areas.map((candidate) => [candidate.slug, candidate.name]));
  const live = clock !== null;
  const dates = dayDates(data.rows, now);
  const names: [string, string] = [dayWords(0, dates[0], live).name, dayWords(1, dates[1], live).name];
  const words = dayWords(day, dates[day], live);
  const groups = byCinema(showingOn(data.rows, day, now, format, !live));
  // With a format chosen, a cinema that gives no format at all is left out, and counted.
  const silent = byCinema(showingOn(data.rows, day, now, null, !live)).filter((group) => group.rows.every((row) => row.format === null)).length;
  const inArea = (slugs: string[]) => groups.filter((group) => slugs.includes(data.cinemas[group.cinema]!.area));
  const inHere = here ? inArea([here.slug]) : [];
  const kept = groups.filter((group) => saved.includes(data.cinemas[group.cinema]!.id));
  const count = (n: number) => `${n} ${n === 1 ? "cinema" : "cinemas"}`;
  const sections: [key: string, title: string, note: string, list: Group[], showAll: boolean][] = here
    ? [
        ["area", `In ${here.name}`, `${count(inHere.length)} · soonest first`, inHere, false],
        ["next", `Next to ${here.name}`, list(here.neighbours.map((slug) => areaNames[slug] ?? slug)), inArea(here.neighbours), false],
        ["rest", "Elsewhere in Lagos", "soonest first", groups.filter((group) => ![here.slug, ...here.neighbours].includes(data.cinemas[group.cinema]!.area)), true],
      ]
    : [["all", format ? `Showing in ${format}` : "All cinemas", `${count(groups.length)} · soonest first`, groups, false]];
  const shown = [...(kept.length ? [["saved", "Your cinemas", "tap a heart to keep one here", kept, false] as (typeof sections)[number]] : []), ...sections].filter(([, , , rows]) => rows.length > 0);
  // Where the times came from: said once, under the first heading, beside the list it describes.
  // Each source the listed cinemas were read from is named, so no cinema's times are credited to another's.
  const fresh = [...new Set(groups.map((group) => sourceLine(data, group.rows[0]!, clock)).filter((line): line is string => line !== null))];

  return (
    <>
      <div className="head">
        <div>
          <h1 className="title">{here ? (<>Cinemas near <u>{here.name}</u></>) : (<>Cinemas in <u>Lagos</u></>)}</h1>
        </div>
        <div className="wide-only">
          <FormatChips tags={formatsOf(data.rows)} value={format} onChange={setFormat} />
        </div>
      </div>
      <div className="filters wide-only">
        <AreaChips areas={areas} current={area} />
        <DayTabs day={day} names={names} onChange={setDay} />
      </div>
      <Pickers areas={areas} area={area} day={day} names={names} onDay={setDay} tags={formatsOf(data.rows)} format={format} onFormat={setFormat} />
      <Banner data={data} now={clock} />
      {format && silent > 0 && (
        <p className="left-out" data-testid="format.left-out">
          {silent === 1 ? "1 cinema doesn't say the format of its showings, so it is not listed here." : `${silent} cinemas don't say the format of their showings, so they are not listed here.`}
        </p>
      )}
      {shown.map(([key, title, note, rows, showAll], index) => {
        const cut = showAll && !open && rows.length > ELSEWHERE;
        return (
          <section key={key} className="vgroup" data-testid={key === "saved" ? "saved" : `group.${key}`}>
            <div className="vhead">
              <h2>{title}</h2>
              {note && <span>{note}</span>}
              {cut && (
                // Opens the rest here: a link to /cinemas would send a visitor with a saved area straight back.
                <button type="button" className="all" data-testid={`group.${key}.all`} onClick={() => setOpen(true)}>
                  Show all {rows.length}
                </button>
              )}
            </div>
            {index === 0 && fresh.length > 0 && (
              <p className="vfresh" data-testid="fresh">
                {fresh.join(" · ")}
              </p>
            )}
            <div className="vgrid">
              {(cut ? rows.slice(0, ELSEWHERE) : rows).map((group) => {
                const id = data.cinemas[group.cinema]!.id;
                return <CinemaRow key={id} cinema={group.cinema} rows={group.rows} data={data} first={!live || day !== 0} now={clock} saved={saved.includes(id)} areaName={key === "area" ? null : (areaNames[data.cinemas[group.cinema]!.area] ?? null)} testId={key === "saved" ? `saved.row.${id}` : `cinema.card.${id}`} />;
              })}
            </div>
          </section>
        );
      })}
      {groups.length === 0 && (
        <div className="empty" data-testid="empty.day" style={{ marginTop: 24 }}>
          {format ? `No cinema is showing a film in ${format} ${words.on}.` : live && day === 0 ? "Nothing more is showing today. Tomorrow's times are one tap away." : `No times are listed ${words.on}.`}
        </div>
      )}
    </>
  );
}
