import { formatTime, lagosDayKey, utcMs } from "@/lib/time/lagos";

// The "Remind me" calendar file (RFC 5545). One event in UTC with one alert 30 minutes before.
// It opens in whichever calendar the phone uses; nothing is sent anywhere.

export type IcsShowing = {
  /** The showing's id; makes the event's UID, so adding it twice updates one event. */
  id: string;
  film: string;
  cinema: string;
  /** Only when we know it. Never guessed. */
  address?: string | null;
  startsAt: string;
  runtimeMin?: number | null;
  bookingUrl?: string | null;
  /** The freshness sentence shown on the row, e.g. "Read from Filmhouse's site 2 hours ago". */
  sourceLine: string;
};

const ALERT_MINUTES = 30;
const MAX_LINE_BYTES = 75;
const encoder = new TextEncoder();

/** "20261106T183000Z" */
function stamp(iso: string): string {
  return new Date(utcMs(iso)).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Escape text for a property value: backslash, semicolon, comma and line breaks. */
function text(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold a line so no physical line is longer than 75 bytes; continuation lines start with a space. */
function fold(line: string): string {
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    // Continuation lines carry a leading space, which counts toward their 75 bytes.
    const limit = parts.length === 0 ? MAX_LINE_BYTES : MAX_LINE_BYTES - 1;
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function buildIcs(showing: IcsShowing, now: string): string {
  const { film, cinema, address, bookingUrl, sourceLine } = showing;
  const duration = showing.runtimeMin && showing.runtimeMin > 0 ? `PT${Math.round(showing.runtimeMin)}M` : "PT2H";
  const booking = bookingUrl ? `Book on the cinema's site: ${bookingUrl}` : "Tickets at the cinema.";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sinima//Showtimes//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${text(showing.id)}@sinima`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(showing.startsAt)}`,
    `DURATION:${duration}`,
    `SUMMARY:${text(`${film} at ${cinema}`)}`,
    `LOCATION:${text(address ? `${cinema}, ${address}` : cinema)}`,
    `DESCRIPTION:${text(`${booking}\n${sourceLine}. Times can change; check with the cinema.`)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${text(`${film} starts in ${ALERT_MINUTES} min at ${cinema}`)}`,
    `TRIGGER:-PT${ALERT_MINUTES}M`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Lowercase words joined by hyphens, with accents removed: "Ọmọ Ghetto!" -> "omo-ghetto". */
function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** "sinners-filmhouse-lekki-imax-2026-11-06-1930.ics": the Lagos day and time of the showing. */
export function icsFileName(showing: Pick<IcsShowing, "film" | "cinema" | "startsAt">): string {
  return `${slug(showing.film)}-${slug(showing.cinema)}-${lagosDayKey(showing.startsAt)}-${formatTime(showing.startsAt).replace(":", "")}.ics`;
}
