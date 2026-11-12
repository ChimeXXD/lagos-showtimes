"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";
import { onBackdrop } from "@/lib/browser";
import type { ListCinema, ListFilm } from "@/lib/data/select";
import { EVENING_ENDS_HOUR, formatDate, formatDay, formatTime, toLagos } from "@/lib/time/lagos";

// Share (the Fixtured pattern Chime picked): a headline, the showing as a tilted ticket, then
// Share and Copy link. The link opens this exact showing and carries nothing else.

type Props = { film: ListFilm; cinema: ListCinema; at: string; now: string; area: string; hash: string; onClose: () => void };

export function SharePanel({ film, cinema, at, now, area, hash, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);

  const day = formatDay(at, now);
  const { hour } = toLagos(at);
  // "Tonight" only from 17:00 to the end of the evening; a morning show is "Today".
  const when = `${day === "Today" && (hour >= 17 || hour < EVENING_ENDS_HOUR) ? "Tonight" : day} · ${formatTime(at)}`;
  const link = () => `${window.location.origin}/cinema/${cinema.id}${hash}`;
  // The message is read later, perhaps on another day, so it names the date, not "Today".
  const text = `${film.title} · ${cinema.name} · ${formatDate(at)}, ${formatTime(at)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard here: the WhatsApp and Share buttons still work.
    }
  }
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sinima", text, url: link() });
      } catch {
        // closed without sharing
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${link()}`)}`, "_blank", "noopener");
    }
  }

  return (
    <dialog ref={dialog} className="modal share" data-testid="share.dialog" aria-labelledby="share-title" onClose={onClose} onClick={(event) => onBackdrop(event) && event.currentTarget.close()}>
      <button type="button" className="round x" aria-label="Close" data-testid="share.close" onClick={() => dialog.current?.close()}>
        <Icon name="x" />
      </button>
      <h3 id="share-title">Films are better with friends</h3>
      <p>Send this showing so your people know what you&apos;re watching.</p>
      <div className="scard" data-testid="share.card">
        <small>{when}</small>
        <b>{film.title}</b>
        <span>{cinema.name}</span>
        <span>{area}, Lagos</span>
        <em>
          <LogoMark />
          sinima-app.vercel.app
        </em>
      </div>
      <div className="minis">
        <a className="mini" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" data-testid="share.whatsapp" onClick={(event) => { event.preventDefault(); window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${link()}`)}`, "_blank", "noopener"); }}>
          <i>
            <Icon name="chat" />
          </i>
          WhatsApp
        </a>
      </div>
      <div className="pair">
        <button type="button" className="btn primary" style={{ minHeight: 52 }} data-testid="share.native" onClick={share}>
          <Icon name="share" />
          Share
        </button>
        <button type="button" className="btn" style={{ minHeight: 52 }} data-testid="share.copy" onClick={copy}>
          {copied ? "Link copied" : (<><Icon name="link" />Copy link</>)}
        </button>
      </div>
    </dialog>
  );
}
