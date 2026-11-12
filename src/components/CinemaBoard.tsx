"use client";

import { useState } from "react";
import { Banner, FilmCard, Times, sourceLine } from "@/components/Cards";
import { ShowingProvider } from "@/components/Showing";
import { byFilm, dayDates, showingOn, type Day } from "@/lib/data/programme";
import type { ListData } from "@/lib/data/select";
import { formatDate } from "@/lib/time/lagos";
import { useNow } from "@/lib/time/useNow";
import { dayWords } from "@/lib/wording/day";

/** One cinema's programme: day tiles, then its films as poster cards with their times. */
export function CinemaBoard({ data, areaNames }: { data: ListData; areaNames: Record<string, string> }) {
  const clock = useNow();
  const now = clock ?? data.at;
  const [day, setDay] = useState<Day>(0);
  const live = clock !== null;
  const films = byFilm(showingOn(data.rows, day, now, null, !live));
  const source = data.rows[0] ? sourceLine(data, data.rows[0], clock) : null;
  const dates = dayDates(data.rows, now);
  const words = dayWords(day, dates[day], live);
  return (
    <ShowingProvider data={data} areaNames={areaNames}>
      <Banner data={data} now={clock} />
      {source && (
        <p className="fresh" style={{ marginTop: 12 }} data-testid="cinema.source">
          Where these times come from: {source}
        </p>
      )}
      <div className="filters">
        <div className="daytiles" role="group" aria-label="Day">
          {(["Today", "Tomorrow"] as const).map((label, index) => (
            <button key={label} type="button" className={day === index ? "dtile on" : "dtile"} aria-pressed={day === index} data-testid={`day.${label.toLowerCase()}`} onClick={() => setDay(index as Day)}>
              <b>{live ? label : formatDate(dates[index]!)}</b>
              {live && <span>{formatDate(dates[index]!)}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="label">
        <h2>Showing {words.on}</h2>
        <span>
          {films.length} {films.length === 1 ? "film" : "films"}, soonest first
        </span>
      </div>
      {films.length === 0 ? (
        <div className="empty" data-testid="empty.day">
          {live && day === 0 ? "Nothing more is showing today. Tap Tomorrow for the next times." : `No times are listed ${words.on}.`}
        </div>
      ) : (
        <div className="pgrid">
          {films.map((group, index) => (
            <FilmCard key={group.film} film={data.films[group.film]!} rows={group.rows} now={day === 0 ? clock : null} index={index}>
              <Times rows={group.rows} data={data} max={3} />
            </FilmCard>
          ))}
        </div>
      )}
    </ShowingProvider>
  );
}
