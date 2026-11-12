"use client";

import Link from "next/link";
import { useRef } from "react";
import { rememberArea, type AreaInfo } from "@/components/Filters";
import { Icon } from "@/components/Icons";
import { onBackdrop } from "@/lib/browser";
import type { FormatTag } from "@/lib/data/format";
import type { Day } from "@/lib/data/programme";

type Sheet = "area" | "day" | "format";
/** Closes the sheet a choice sits in. */
const shut = (event: React.MouseEvent<HTMLElement>) => event.currentTarget.closest("dialog")?.close();

/**
 * The Cinemas tab's filters on a phone (D-56, option 1): one row of three pickers, each opening a
 * sheet from the bottom. A computer keeps the chips (AreaChips, DayTabs, FormatChips).
 */
export function Pickers({ areas, area, day, names, onDay, tags, format, onFormat }: { areas: AreaInfo[]; area: string | null; day: Day; names: [string, string]; onDay: (day: Day) => void; tags: FormatTag[]; format: FormatTag | null; onFormat: (tag: FormatTag | null) => void }) {
  const sheets = { area: useRef<HTMLDialogElement>(null), day: useRef<HTMLDialogElement>(null), format: useRef<HTMLDialogElement>(null) };
  const open = (sheet: Sheet) => sheets[sheet].current?.showModal();
  const here = areas.find((candidate) => candidate.slug === area);
  const total = areas.reduce((sum, candidate) => sum + candidate.cinemas, 0);

  const sheet = (id: Sheet, title: string, body: React.ReactNode) => (
    <dialog ref={sheets[id]} className="modal pick" data-testid={`sheet.${id}`} aria-labelledby={`sheet-${id}`} onClick={(event) => onBackdrop(event) && event.currentTarget.close()}>
      <h2 id={`sheet-${id}`}>{title}</h2>
      <div className="pick-list">{body}</div>
    </dialog>
  );
  const choice = (on: boolean, label: React.ReactNode, testId: string, pick: () => void) => (
    <button key={testId} type="button" className={on ? "on" : undefined} aria-pressed={on} data-testid={testId} onClick={(event) => { pick(); shut(event); }}>
      {label}
    </button>
  );

  return (
    <>
      <div className="pickers" role="group" aria-label="Filters">
        <button type="button" className="picker" data-testid="pick.area" aria-haspopup="dialog" onClick={() => open("area")}>
          <Icon name="pin" />
          <span>{here?.name ?? "All Lagos"}</span>
          <Icon name="caret" />
        </button>
        <button type="button" className="picker" data-testid="pick.day" aria-haspopup="dialog" onClick={() => open("day")}>
          <span>{names[day]}</span>
          <Icon name="caret" />
        </button>
        {tags.length > 0 && (
          <button type="button" className={format ? "picker on" : "picker"} data-testid="pick.format" aria-haspopup="dialog" onClick={() => open("format")}>
            <span>{format ?? "Format"}</span>
            <Icon name="caret" />
          </button>
        )}
      </div>
      {sheet(
        "area",
        "Choose an area",
        <>
          <Link href="/cinemas" className={area ? undefined : "on"} data-testid="sheet.area.all" onClick={(event) => { rememberArea(null); shut(event); }}>
            All Lagos<span>{total} cinemas</span>
          </Link>
          {areas.map((candidate) => (
            <Link key={candidate.slug} href={`/area/${candidate.slug}`} className={candidate.slug === area ? "on" : undefined} data-testid={`sheet.area.${candidate.slug}`} onClick={(event) => { rememberArea(candidate.slug); shut(event); }}>
              {candidate.name}
              <span>{candidate.cinemas} {candidate.cinemas === 1 ? "cinema" : "cinemas"}</span>
            </Link>
          ))}
        </>,
      )}
      {sheet(
        "day",
        "Choose a day",
        ([0, 1] as const).map((option) => choice(day === option, names[option], `day.option.${option === 0 ? "today" : "tomorrow"}`, () => onDay(option))),
      )}
      {sheet(
        "format",
        "Choose a format",
        <>
          {choice(format === null, "Any format", "format.option.any", () => onFormat(null))}
          {tags.map((tag) => choice(format === tag, tag, `format.option.${tag}`, () => onFormat(tag)))}
        </>,
      )}
    </>
  );
}
