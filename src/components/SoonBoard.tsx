"use client";

import { Banner, FilmCard, Times } from "@/components/Cards";
import { AreaChips, type AreaInfo } from "@/components/Filters";
import { ShowingProvider } from "@/components/Showing";
import { useAreaChoice } from "@/lib/browser";
import { groupShowings, laterName, type ListData, type ListRow } from "@/lib/data/select";
import { countdown } from "@/lib/time/countdown";
import { useNow } from "@/lib/time/useNow";
import { dayWords } from "@/lib/wording/day";
import { dayDates, showingOn } from "@/lib/data/programme";

/** How many showings the page's own HTML lists before the browser takes over; the rest arrive with it. */
const STATIC_ROWS = 40;

/** Starting soon: what begins in the next 2 hours near you, then later tonight (SPEC §3). */
export function SoonBoard({ data, areas }: { data: ListData; areas: AreaInfo[] }) {
  const clock = useNow();
  const now = clock ?? data.at;
  const [area, setArea] = useAreaChoice(areas);

  const areaNames = Object.fromEntries(areas.map((candidate) => [candidate.slug, candidate.name]));
  const place = area ? areaNames[area] : "Lagos";
  const live = clock !== null;
  const inPlace = data.rows.filter((row) => area === null || data.cinemas[row.cinema]!.area === area);
  const groups = groupShowings(inPlace, now);
  const card = (row: ListRow, index: number, soon: boolean) => (
    <FilmCard key={`${row.cinema}-${row.film}-${row.at}`} film={data.films[row.film]!} rows={[row]} now={null} index={index}>
      <p className="pmeta" style={{ marginTop: 0 }}>
        {data.cinemas[row.cinema]!.name}
      </p>
      {soon && clock && (
        <p className="pmeta" style={{ marginTop: 0, fontWeight: 600 }} data-testid="soon.countdown">
          {countdown(row.at, clock)}
        </p>
      )}
      <Times rows={[row]} data={data} max={1} />
    </FilmCard>
  );
  return (
    <ShowingProvider data={data} areaNames={areaNames}>
      <div className="head">
        <div>
          <h1 className="title">Starting soon in <u>{place}</u></h1>
        </div>
      </div>
      <div className="filters">
        <AreaChips areas={areas} current={area} onPick={setArea} />
      </div>
      <Banner data={data} now={clock} />
      {!live && (
        // Before the browser has the time, nothing can be called "soon": the day's showings, by date.
        <>
          <div className="label">
            <h2>Showings {dayWords(0, dayDates(data.rows, now)[0], false).on}</h2>
          </div>
          <section className="pgrid" data-testid="section.day">
            {showingOn(inPlace, 0, now, null, true).slice(0, STATIC_ROWS).map((row, index) => card(row, index, false))}
          </section>
        </>
      )}
      {live && (
        <div className="label">
          <h2>Starting soon</h2>
          <span>next 2 hours</span>
        </div>
      )}
      {!live ? null : groups.soon.length === 0 ? (
        <p className="empty" data-testid="empty.soon">
          Nothing starts in the next 2 hours in {place}.{groups.later.length > 0 ? ` Here's ${laterName(now).toLowerCase()}.` : ""}
        </p>
      ) : (
        <section className="pgrid" data-testid="section.soon">
          {groups.soon.map((row, index) => card(row, index, true))}
        </section>
      )}
      {live && groups.later.length > 0 && (
        <>
          <div className="label">
            <h2>{laterName(now)}</h2>
            <span>
              {groups.later.length} {groups.later.length === 1 ? "showing" : "showings"}
            </span>
          </div>
          <section className="pgrid" data-testid="section.later">
            {groups.later.map((row, index) => card(row, index, false))}
          </section>
        </>
      )}
    </ShowingProvider>
  );
}
