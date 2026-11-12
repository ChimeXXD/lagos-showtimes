"use client";

import Link from "next/link";
import { Icon } from "@/components/Icons";
import { AREA_KEY } from "@/lib/area";
import type { FormatTag } from "@/lib/data/format";
import type { Day } from "@/lib/data/programme";

export type AreaInfo = { slug: string; name: string; neighbours: string[]; cinemas: number };

/** Remembers the area on this phone only; null forgets it. */
export function rememberArea(slug: string | null) {
  try {
    if (slug) localStorage.setItem(AREA_KEY, slug);
    else localStorage.removeItem(AREA_KEY);
  } catch {
    // Storage can be switched off: the choice just is not remembered.
  }
}

const DEFAULT_AREAS = ["lekki", "victoria-island", "ikeja"];

/**
 * The area, on the page (D-49): the current area and the ones next to it as chips, then All Lagos
 * and a short menu of every area. With `onPick` the chips filter the page; without it they are
 * links to each area's home.
 */
export function AreaChips({ areas, current, onPick }: { areas: AreaInfo[]; current: string | null; onPick?: (slug: string | null) => void }) {
  const here = areas.find((area) => area.slug === current);
  const shown = (here ? [here.slug, ...here.neighbours] : DEFAULT_AREAS).map((slug) => areas.find((area) => area.slug === slug)).filter((area): area is AreaInfo => Boolean(area));
  const chip = (slug: string | null, label: React.ReactNode, testId: string, className = "chip") => {
    const on = slug === current;
    const props = { className: on ? `${className} on` : className, "data-testid": testId, "aria-current": on ? ("true" as const) : undefined };
    return onPick ? (
      <button type="button" {...props} aria-pressed={on} aria-current={undefined} onClick={() => onPick(slug)}>
        {label}
      </button>
    ) : (
      <Link href={slug ? `/area/${slug}` : "/"} {...props} onClick={() => rememberArea(slug)}>
        {label}
      </Link>
    );
  };
  return (
    <div className="chips area" role="group" aria-label="Area">
      {/* On a phone only this part scrolls sideways; the menu sits outside it, or the scrolling row would cut it off. */}
      <div className="chips-row">
        {shown.map((area) => (
          <span key={area.slug}>{chip(area.slug, area.slug === current ? (<><Icon name="pin" />{area.name}</>) : area.name, `area.chip.${area.slug}`)}</span>
        ))}
        <i className="sep" />
        {chip(null, "All Lagos", "area.chip.all")}
      </div>
      <details className="pop">
        <summary className="chip" data-testid="area.more">
          More areas <Icon name="caret" />
        </summary>
        <div className="menu">
          {areas.map((area) => (
            <span key={area.slug}>
              {onPick ? (
                <a href={`#${area.slug}`} className={area.slug === current ? "on" : undefined} data-testid={`area.option.${area.slug}`} onClick={(event) => { event.preventDefault(); onPick(area.slug); event.currentTarget.closest("details")?.removeAttribute("open"); }}>
                  {area.name}
                  <span>{area.cinemas} {area.cinemas === 1 ? "cinema" : "cinemas"}</span>
                </a>
              ) : (
                <Link href={`/area/${area.slug}`} className={area.slug === current ? "on" : undefined} data-testid={`area.option.${area.slug}`} onClick={() => rememberArea(area.slug)}>
                  {area.name}
                  <span>{area.cinemas} {area.cinemas === 1 ? "cinema" : "cinemas"}</span>
                </Link>
              )}
            </span>
          ))}
        </div>
      </details>
    </div>
  );
}

export function FormatChips({ tags, value, onChange }: { tags: FormatTag[]; value: FormatTag | null; onChange: (tag: FormatTag | null) => void }) {
  if (tags.length === 0) return null;
  return (
    <div className="chips" role="group" aria-label="Format">
      <button type="button" className={value === null ? "chip on" : "chip"} aria-pressed={value === null} data-testid="format.chip.any" onClick={() => onChange(null)}>
        Any format
      </button>
      {tags.map((tag) => (
        <button key={tag} type="button" className={value === tag ? "chip on" : "chip"} aria-pressed={value === tag} data-testid={`format.chip.${tag}`} onClick={() => onChange(tag)}>
          {tag}
        </button>
      ))}
    </div>
  );
}

/** `names` are what the two days are called: Today and Tomorrow, or their dates before the time is known. */
export function DayTabs({ day, names, onChange }: { day: Day; names: [string, string]; onChange: (day: Day) => void }) {
  return (
    <div className="days" role="group" aria-label="Day">
      {(["Today", "Tomorrow"] as const).map((label, index) => (
        <button key={label} type="button" className={day === index ? "day on" : "day"} aria-pressed={day === index} data-testid={`day.${label.toLowerCase()}`} onClick={() => onChange(index as Day)}>
          {names[index]}
        </button>
      ))}
    </div>
  );
}
