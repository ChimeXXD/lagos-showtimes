"use client";

import { useState } from "react";
import { Banner, FilmCard } from "@/components/Cards";
import { DayTabs, FormatChips } from "@/components/Filters";
import type { FormatTag } from "@/lib/data/format";
import { byFilm, dayDates, formatsOf, showingOn, type Day } from "@/lib/data/programme";
import type { ListData } from "@/lib/data/select";
import { formatTime } from "@/lib/time/lagos";
import { useQuery } from "@/lib/browser";
import { useNow } from "@/lib/time/useNow";
import { dayWords } from "@/lib/wording/day";

/** Every film showing in Lagos as posters, with a search box and the format chips (D-50). */
export function FilmsBoard({ data }: { data: ListData }) {
  const clock = useNow();
  const now = clock ?? data.at;
  const [day, setDay] = useState<Day>(0);
  const [format, setFormat] = useState<FormatTag | null>(null);
  // The search box in the header sends its text here as ?q=; typing in the box below takes over.
  const sent = useQuery("q");
  const [typed, setQuery] = useState<string | null>(null);
  const query = typed ?? sent ?? "";

  const wanted = query.trim().toLowerCase();
  const live = clock !== null;
  const dates = dayDates(data.rows, now);
  const names: [string, string] = [dayWords(0, dates[0], live).name, dayWords(1, dates[1], live).name];
  const words = dayWords(day, dates[day], live);
  const films = byFilm(showingOn(data.rows, day, now, format, !live)).filter((group) => data.films[group.film]!.title.toLowerCase().includes(wanted));
  return (
    <>
      <div className="head">
        <div>
          <h1 className="title">Films in <u>Lagos</u></h1>
        </div>
        <FormatChips tags={formatsOf(data.rows)} value={format} onChange={setFormat} />
      </div>
      <div className="filters">
        <label style={{ flex: 1 }}>
          <span className="sr-only">Find a film by its title</span>
          <input className="find" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a film" autoComplete="off" data-testid="films.filter" />
        </label>
        <DayTabs day={day} names={names} onChange={setDay} />
      </div>
      <Banner data={data} now={clock} />
      <div className="label">
        <h2>{format ? `Showing in ${format}` : "Now showing"}</h2>
        <span>
          {films.length} {films.length === 1 ? "film" : "films"} {live && day === 0 ? "still to start today" : words.on}
        </span>
      </div>
      {films.length === 0 ? (
        <p className="empty" data-testid="films.none">
          {wanted ? `No film showing matches "${query.trim()}".` : format ? `No film is showing in ${format} ${words.on}.` : live && day === 0 ? "Nothing more is showing today." : `No times are listed ${words.on}.`}
        </p>
      ) : (
        <div className="pgrid">
          {films.map((group, index) => {
            const cinemas = new Set(group.rows.map((row) => row.cinema)).size;
            return (
              <FilmCard key={group.film} film={data.films[group.film]!} rows={group.rows} now={day === 0 ? clock : null} index={index}>
                <p className="pmeta" style={{ marginTop: 0 }}>
                  {cinemas} {cinemas === 1 ? "cinema" : "cinemas"} · {live ? "next" : "from"} <time dateTime={group.rows[0]!.at}>{formatTime(group.rows[0]!.at)}</time>
                </p>
              </FilmCard>
            );
          })}
        </div>
      )}
    </>
  );
}
