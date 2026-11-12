"use client";

import Link from "next/link";
import { useState } from "react";
import { Banner, CinemaCard } from "@/components/Cards";
import { AreaChips, DayTabs, FormatChips, type AreaInfo } from "@/components/Filters";
import { Heart } from "@/components/Icons";
import { ShowingProvider } from "@/components/Showing";
import type { FormatTag } from "@/lib/data/format";
import { byCinema, dayDates, formatsOf, showingOn, type Day } from "@/lib/data/programme";
import { dayWords } from "@/lib/wording/day";
import type { ListData } from "@/lib/data/select";
import { formatTime } from "@/lib/time/lagos";
import { useSaved } from "@/lib/saved";
import { useNow } from "@/lib/time/useNow";
import { list } from "@/lib/wording/credits";

/** Home: the cinemas near you, soonest first (D-49). `area` is null for all of Lagos. */
export function CinemasBoard({ data, areas, area }: { data: ListData; areas: AreaInfo[]; area: string | null }) {
  const clock = useNow();
  const now = clock ?? data.at;
  const saved = useSaved();
  const [day, setDay] = useState<Day>(0);
  const [format, setFormat] = useState<FormatTag | null>(null);

  const here = areas.find((candidate) => candidate.slug === area) ?? null;
  const areaNames = Object.fromEntries(areas.map((candidate) => [candidate.slug, candidate.name]));
  const live = clock !== null;
  const dates = dayDates(data.rows, now);
  const names: [string, string] = [dayWords(0, dates[0], live).name, dayWords(1, dates[1], live).name];
  const words = dayWords(day, dates[day], live);
  const all = showingOn(data.rows, day, now, null, !live);
  const groups = byCinema(showingOn(data.rows, day, now, format, !live));
  // With a format chosen, a cinema that gives no format at all is left out, and counted.
  const silent = byCinema(all).filter((group) => group.rows.every((row) => row.format === null)).length;
  const inArea = (slugs: string[]) => groups.filter((group) => slugs.includes(data.cinemas[group.cinema]!.area));
  const sections = here
    ? [
        ["area", `In ${here.name}`, "soonest first", inArea([here.slug])],
        ["next", `Next to ${here.name}`, list(here.neighbours.map((slug) => areaNames[slug] ?? slug)), inArea(here.neighbours)],
        ["rest", "Elsewhere in Lagos", "", groups.filter((group) => ![here.slug, ...here.neighbours].includes(data.cinemas[group.cinema]!.area))],
      ] as const
    : ([["all", "All cinemas", "soonest first", groups]] as const);
  const kept = saved.map((id) => data.cinemas.findIndex((cinema) => cinema.id === id)).filter((index) => index >= 0);
  let card = 0;

  return (
    <ShowingProvider data={data} areaNames={areaNames}>
      <div className="head">
        <div>
          <h1 className="title">{here ? (<>Cinemas near <u>{here.name}</u></>) : (<>Cinemas in <u>Lagos</u></>)}</h1>
        </div>
        <FormatChips tags={formatsOf(data.rows)} value={format} onChange={setFormat} />
      </div>
      <div className="filters">
        <AreaChips areas={areas} current={area} />
        <DayTabs day={day} names={names} onChange={setDay} />
      </div>
      <Banner data={data} now={clock} />
      {kept.length > 0 && (
        <section data-testid="saved">
          <div className="label">
            <h2>Your cinemas</h2>
          </div>
          <div className="saved">
            {kept.map((index) => {
              const cinema = data.cinemas[index]!;
              const next = all.find((row) => row.cinema === index);
              return (
                <Link key={cinema.id} href={`/cinema/${cinema.id}`} data-testid={`saved.row.${cinema.id}`}>
                  <Heart on />
                  <span>
                    <b>{cinema.name}</b>
                    <span>
                      {areaNames[cinema.area]} · {next ? `next ${formatTime(next.at)}` : day === 0 ? "nothing more today" : "nothing listed"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      {format && silent > 0 && (
        <p className="left-out" data-testid="format.left-out">
          {silent === 1 ? "1 cinema doesn't say the format of its showings, so it is not listed here." : `${silent} cinemas don't say the format of their showings, so they are not listed here.`}
        </p>
      )}
      {sections.map(([key, title, sub, list]) =>
        list.length === 0 ? null : (
          <section key={key} data-testid={`group.${key}`}>
            <div className="label">
              <h2>{title}</h2>
              {sub && <span>{sub}</span>}
            </div>
            <div className="cgrid">
              {list.map((group) => (
                <CinemaCard key={group.cinema} cinema={group.cinema} rows={group.rows} data={data} when={live ? (day === 0 ? "still to start today" : "tomorrow") : words.on} now={day === 0 ? clock : null} saved={saved.includes(data.cinemas[group.cinema]!.id)} areaName={areaNames[data.cinemas[group.cinema]!.area] ?? ""} index={card++} />
              ))}
            </div>
          </section>
        ),
      )}
      {groups.length === 0 && (
        <div className="empty" data-testid="empty.day" style={{ marginTop: 24 }}>
          {format ? `No cinema is showing a film in ${format} ${words.on}.` : live && day === 0 ? "Nothing more is showing today. Tomorrow's times are one tap away." : `No times are listed ${words.on}.`}
        </div>
      )}
    </ShowingProvider>
  );
}
