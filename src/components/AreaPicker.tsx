"use client";

import Link from "next/link";
import { useRef } from "react";
import { AREA_KEY } from "@/lib/area";

type AreaOption = { slug: string; name: string; cinemas: number };

const OPTION = "flex min-h-12 items-center justify-between gap-3 border-b border-line text-body";

/** The black capsule in the header and the sheet it opens (UI brief §4.2). */
export function AreaPicker({ areas, current }: { areas: AreaOption[]; current?: string | null }) {
  const sheet = useRef<HTMLDialogElement>(null);
  const choose = (slug: string | null) => {
    try {
      if (slug) localStorage.setItem(AREA_KEY, slug);
      else localStorage.removeItem(AREA_KEY);
    } catch {
      // Storage can be switched off; the link still works, the choice is just not remembered.
    }
    sheet.current?.close();
  };
  const name = areas.find((area) => area.slug === current)?.name;

  return (
    <>
      <button type="button" data-testid="area.button" onClick={() => sheet.current?.showModal()} className="inline-flex min-h-11 items-center gap-1.5 rounded-chip bg-accent px-3.5 text-[14px] font-semibold text-accent-text">
        {name ?? "Pick your area"} <span aria-hidden="true">▾</span>
      </button>
      <dialog ref={sheet} aria-labelledby="area-sheet-title" className="fixed inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-t-sheet bg-bg p-4 text-text backdrop:bg-scrim">
        <div className="flex items-center justify-between">
          <h2 id="area-sheet-title" className="text-section font-semibold">
            Pick your area
          </h2>
          <form method="dialog">
            <button data-testid="area.close" className="inline-flex min-h-11 items-center rounded-chip border border-line px-3.5 text-[14px] font-semibold">
              Close
            </button>
          </form>
        </div>
        <ul className="mt-2">
          <li>
            <Link href="/" onClick={() => choose(null)} data-testid="area.option.all" aria-current={current === null ? "page" : undefined} className={`${OPTION} font-semibold`}>
              All Lagos
            </Link>
          </li>
          {areas.map((area) => (
            <li key={area.slug}>
              <Link href={`/area/${area.slug}`} onClick={() => choose(area.slug)} data-testid={`area.option.${area.slug}`} aria-current={area.slug === current ? "page" : undefined} className={OPTION}>
                <span>
                  <span className="font-semibold">{area.name}</span>
                  <span className="text-text-muted">
                    {" "}
                    · {area.cinemas} {area.cinemas === 1 ? "cinema" : "cinemas"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
