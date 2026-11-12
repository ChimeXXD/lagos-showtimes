"use client";

import Link from "next/link";
import { useState } from "react";
import { Banner, sourceLine } from "@/components/Cards";
import { AreaChips, type AreaInfo } from "@/components/Filters";
import { Heart } from "@/components/Icons";
import { ShowingProvider, TimeChip } from "@/components/Showing";
import { useAreaChoice } from "@/lib/browser";
import type { FormatTag } from "@/lib/data/format";
import { byCinema, dayDates, formatsOf, showingOn, type Day } from "@/lib/data/programme";
import type { ListData } from "@/lib/data/select";
import { toggleSaved, useSaved } from "@/lib/saved";
import { useNow } from "@/lib/time/useNow";
import { dayWords } from "@/lib/wording/day";

/** One film: choose a format, an area and a day, and see only the cinemas that match (D-50). */
export function FilmBoard({ data, areas }: { data: ListData; areas: AreaInfo[] }) {
  const clock = useNow();
  const now = clock ?? data.at;
  const saved = useSaved();
  const [day, setDay] = useState<Day>(0);
  const [format, setFormat] = useState<FormatTag | null>(null);
  const [area, setArea] = useAreaChoice(areas);

  const film = data.films[0]!;
  const areaNames = Object.fromEntries(areas.map((candidate) => [candidate.slug, candidate.name]));
  const inArea = (rows: ListData["rows"]) => rows.filter((row) => area === null || data.cinemas[row.cinema]!.area === area);
  const live = clock !== null;
  const dates = dayDates(data.rows, now);
  const names: [string, string] = [dayWords(0, dates[0], live).name, dayWords(1, dates[1], live).name];
  const words = dayWords(day, dates[day], live);
  const everyFormat = byCinema(inArea(showingOn(data.rows, day, now, null, !live)));
  const venues = byCinema(inArea(showingOn(data.rows, day, now, format, !live)));
  const leftOut = everyFormat.length - venues.length;
  const place = area ? areaNames[area] : "Lagos";
  const tags = formatsOf(data.rows);
  const pick = (value: FormatTag | null, label: string) => (
    <button type="button" className={format === value ? "chip on" : "chip"} aria-pressed={format === value} data-testid={`format.chip.${value ?? "any"}`} onClick={() => setFormat(value)}>
      {label}
    </button>
  );

  return (
    <ShowingProvider data={data} areaNames={areaNames}>
      <Banner data={data} now={clock} />
      {tags.length > 0 && (
        <div className="frow" style={{ marginTop: 16 }}>
          <span>Format</span>
          {pick(null, "All")}
          {tags.map((tag) => (
            <span key={tag}>{pick(tag, tag)}</span>
          ))}
        </div>
      )}
      <div className="frow" style={tags.length ? undefined : { marginTop: 16 }}>
        <span>Area</span>
        <AreaChips areas={areas} current={area} onPick={setArea} />
      </div>
      <div className="frow">
        <span>Day</span>
        {(["Today", "Tomorrow"] as const).map((label, index) => (
          <button key={label} type="button" className={day === index ? "chip on" : "chip"} aria-pressed={day === index} data-testid={`day.${label.toLowerCase()}`} onClick={() => setDay(index as Day)}>
            {names[index]}
          </button>
        ))}
      </div>
      <div className="label" style={{ marginTop: 20 }}>
        <h2>{format ? `In ${format} ${area ? "near" : "in"} ${place}` : `Showing ${area ? "near" : "in"} ${place}`}</h2>
        <span>
          {venues.length} {venues.length === 1 ? "cinema" : "cinemas"}
        </span>
      </div>
      {venues.length === 0 && (
        <p className="empty" data-testid="empty.film">
          No cinema in {place} is showing {film.title}
          {format ? ` in ${format}` : ""} {words.on}.
        </p>
      )}
      {venues.map((group, index) => {
        const cinema = data.cinemas[group.cinema]!;
        const isSaved = saved.includes(cinema.id);
        const source = sourceLine(data, group.rows[0]!, clock);
        return (
          <article key={cinema.id} className="venue" data-testid={`venue.${cinema.id}`} style={{ "--i": Math.min(index, 8) } as React.CSSProperties}>
            <div className="venue-top">
              <div>
                <div className="tags">
                  {formatsOf(group.rows).map((tag) => (
                    <span key={tag} className="tag y">
                      {tag}
                    </span>
                  ))}
                  <span className="tag q">{cinema.online ? "Book online" : "Tickets at the cinema"}</span>
                </div>
                <h3 className="cname" style={{ marginTop: 6 }}>
                  <Link href={`/cinema/${cinema.id}`}>{cinema.name}</Link>
                </h3>
                <p className="cmeta">{areaNames[cinema.area]}</p>
              </div>
              <button type="button" className="round" aria-pressed={isSaved} aria-label={`${isSaved ? "Remove" : "Keep"} ${cinema.name} ${isSaved ? "from" : "in"} your cinemas`} onClick={() => toggleSaved(cinema.id)}>
                <Heart on={isSaved} />
              </button>
            </div>
            <div className="slots">
              {group.rows.map((row) => (
                <TimeChip key={row.at} row={row} data={data} slot now={day === 0 ? clock : null} />
              ))}
            </div>
            {source && (
              <p className="fresh" style={{ marginTop: 12 }}>
                {source}
              </p>
            )}
          </article>
        );
      })}
      {format && leftOut > 0 && (
        <p className="left-out" data-testid="format.left-out">
          {leftOut === 1 ? `1 more cinema shows ${film.title} in another format or doesn't say the format.` : `${leftOut} more cinemas show ${film.title} in another format or don't say the format.`}
        </p>
      )}
    </ShowingProvider>
  );
}
