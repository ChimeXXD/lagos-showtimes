"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icons";
import { Poster } from "@/components/Poster";
import { SharePanel } from "@/components/Share";
import { formatTag } from "@/lib/data/format";
import type { ListData, ListRow } from "@/lib/data/select";
import { buildIcs, icsFileName } from "@/lib/ics/ics";
import { countdown } from "@/lib/time/countdown";
import { formatDate, formatDay, formatTime, utcMs, utcString } from "@/lib/time/lagos";
import { isBeforeStart, showingState } from "@/lib/time/showingState";
import { useNow } from "@/lib/time/useNow";
import { onBackdrop, useHash } from "@/lib/browser";
import { runtimeText } from "@/lib/wording/film";
import { freshness } from "@/lib/wording/freshness";

// One showing, opened from any time on the page (D-49): the ticket, the countdown, where the time
// came from, then Book, Remind me and Share. A link ending in #s=<film>@<start> opens it directly.

type Open = (row: ListRow) => void;
const ShowingContext = createContext<Open>(() => {});
export const useOpenShowing = () => useContext(ShowingContext);

export const showingHash = (data: ListData, row: ListRow) => `#s=${data.films[row.film]!.id}@${row.at}`;

export function ShowingProvider({ data, areaNames, children }: { data: ListData; areaNames: Record<string, string>; children: React.ReactNode }) {
  const [picked, setPicked] = useState<ListRow | null>(null);
  const [closedLink, setClosedLink] = useState(false);
  const [sharing, setSharing] = useState(false);
  // A shared link names its showing after the #; it opens until it is closed once.
  const hash = useHash();
  const linked = !closedLink && hash.startsWith("#s=") ? (data.rows.find((candidate) => showingHash(data, candidate) === hash) ?? null) : null;
  const row = picked ?? linked;
  const panel = useRef<HTMLDialogElement>(null);
  const clock = useNow();
  const now = clock ?? data.at;

  const open = useCallback<Open>((next) => {
    setPicked(next);
    setSharing(false);
  }, []);
  // The dialog opens after the row is drawn, so it never shows empty.
  useEffect(() => {
    if (row && panel.current && !panel.current.open) panel.current.showModal();
  }, [row]);

  const film = row ? data.films[row.film]! : null;
  const cinema = row ? data.cinemas[row.cinema]! : null;
  const from = row ? data.fresh[row.fresh]! : null;
  const fresh = row && from ? freshness({ name: from.source, method: from.method }, from.fetchedAt, now, from.via) : null;
  const canStillStart = row ? isBeforeStart(showingState(row.at, now)) : false;

  function remind() {
    if (!row || !film || !cinema || !fresh) return;
    const showing = { id: `${cinema.id}_${film.id}_${row.at}`, film: film.title, cinema: cinema.name, address: cinema.address, startsAt: row.at, runtimeMin: film.runtimeMin, bookingUrl: row.book, sourceLine: fresh.text };
    const url = URL.createObjectURL(new Blob([buildIcs(showing, now)], { type: "text/calendar" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: icsFileName(showing) });
    document.body.append(link);
    link.click();
    link.remove();
    // Not at once: Safari on an iPhone can still be reading the file when the click returns.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <ShowingContext.Provider value={open}>
      {children}
      <dialog ref={panel} className="panel" data-testid="showing.panel" aria-label="This showing" onClose={(event) => {
          // React also sends the Share box's close up to here; only the panel's own close ends the showing.
          if (event.target !== event.currentTarget) return;
          setPicked(null);
          setClosedLink(true);
        }} onClick={(event) => onBackdrop(event) && event.currentTarget.close()}>
        {row && film && cinema && fresh && (
          <>
            <div className="panel-head">
              <b>This showing</b>
              <button type="button" className="round" data-testid="showing.close" aria-label="Close" onClick={() => panel.current?.close()}>
                <Icon name="x" />
              </button>
            </div>
            <div className="panel-body">
              <div className="ticket">
                <div>
                  <Poster film={film} small />
                </div>
                <div>
                  <h3 data-testid="showing.title">{film.title}</h3>
                  <p data-testid="showing.cinema">{cinema.name}</p>
                  <time className="big" dateTime={row.at} data-testid="showing.time">
                    {formatTime(row.at)}
                  </time>
                  <p>
                    {formatDay(row.at, now)}, {formatDate(row.at)}
                  </p>
                </div>
              </div>
              <div className="count" data-testid="showing.countdown">
                {clock ? (countdown(row.at, clock) ?? "This showing has ended") : formatDate(row.at)}
              </div>
              <div className="facts">
                <div className="fact">
                  <span>Runs</span>
                  <b>{film.runtimeMin ? `${runtimeText(film.runtimeMin)} · out about ${formatTime(utcString(utcMs(row.at) + film.runtimeMin * 60_000))}` : "Not listed"}</b>
                </div>
                <div className="fact">
                  <span>Rating</span>
                  <b>{film.rating ?? "Not listed"}</b>
                </div>
                <div className="fact">
                  <span>Format</span>
                  <b>{formatTag(row.format) ?? row.format ?? `Not listed by ${cinema.chain}`}</b>
                </div>
                <div className="fact">
                  <span>Where</span>
                  <b>{areaNames[cinema.area] ?? cinema.area}</b>
                </div>
              </div>
              <div className="stay" style={{ margin: 0 }}>
                <b>{film.stay.chip}</b>
                <span>{film.stay.detail}</span>
              </div>
              <p className={fresh.band === "stale" || fresh.band === "old" ? "fresh stale" : "fresh"} data-testid="showing.freshness">
                {fresh.text}
              </p>
            </div>
            <div className="panel-foot">
              {!canStillStart ? null : fresh.band === "sample" ? (
                <span className="btn primary big sample" data-testid="showing.sample">
                  Sample only
                </span>
              ) : !fresh.bookable ? (
                <a className="btn big" href={from?.via?.url ?? from?.url} target="_blank" rel="noopener" data-testid="showing.check">
                  Check on {from?.via?.url ? from.via.name : from?.source} <Icon name="out" />
                </a>
              ) : row.book ? (
                <a className="btn primary big" href={row.book} target="_blank" rel="noopener" data-testid="showing.book">
                  Book on {cinema.chain}&apos;s site <Icon name="out" />
                </a>
              ) : (
                <p className="count" data-testid="showing.at-cinema">
                  Tickets at the cinema{cinema.address ? `: ${cinema.address}` : ""}
                </p>
              )}
              <div className="pair">
                <button type="button" className="btn" data-testid="showing.remind" onClick={remind}>
                  <Icon name="bell" />
                  Remind me
                </button>
                <button type="button" className="btn" data-testid="showing.share" onClick={() => setSharing(true)}>
                  <Icon name="share" />
                  Share
                </button>
              </div>
            </div>
            {sharing && <SharePanel film={film} cinema={cinema} at={row.at} now={now} area={areaNames[cinema.area] ?? cinema.area} hash={showingHash(data, row)} onClose={() => setSharing(false)} />}
          </>
        )}
      </dialog>
    </ShowingContext.Provider>
  );
}

/** A start time. Tapping it opens the showing. */
export function TimeChip({ row, data, slot = false, now }: { row: ListRow; data: ListData; slot?: boolean; now?: string | null }) {
  const open = useOpenShowing();
  const film = data.films[row.film]!;
  const tag = formatTag(row.format);
  const label = `${film.title}, ${formatTime(row.at)} at ${data.cinemas[row.cinema]!.name}`;
  if (slot) {
    return (
      <button type="button" className="slot" data-testid={`time.${film.id}.${row.at}`} aria-label={label} onClick={() => open(row)}>
        <span>
          <b>
            <time dateTime={row.at}>{formatTime(row.at)}</time>
          </b>
          <span>{row.format ?? "Format not listed"}</span>
        </span>
        {now && <span className="go">{countdown(row.at, now)}</span>}
      </button>
    );
  }
  return (
    <button type="button" className="t" data-testid={`time.${film.id}.${row.at}`} aria-label={label} onClick={() => open(row)}>
      <time dateTime={row.at}>{formatTime(row.at)}</time>
      {tag && <small>{tag}</small>}
    </button>
  );
}
