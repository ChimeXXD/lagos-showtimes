// Parsers for Lagocine's static pages (D-33): the day page (every showing in Lagos on one day)
// and a cinema's page (its programme for each day it lists). They read saved HTML only; fetching
// is refresh's job. Lagocine's cinema ids are the ids in data/cinemas.json.
import * as cheerio from "cheerio";
import { clean, lagosOffsetTimeToUtc, type ParsedPage, type RawShowing } from "./raw.ts";

/** Lagocine's badge for a film it has no rating for. */
const NOT_RATED = "NR";

const rating = (badge: string | undefined) => {
  const text = clean(badge);
  return text === NOT_RATED ? null : text;
};

function builtAt($: cheerio.CheerioAPI): string | null {
  const stamp = $('meta[name="lagocine-built"]').attr("content");
  return stamp ? lagosOffsetTimeToUtc(stamp) : null;
}

/** https://lagocine.com/day/<yyyy-mm-dd>/ */
export function parseLagocineDay(html: string): ParsedPage {
  const $ = cheerio.load(html);
  const cards = $("article.movie-card");
  if (cards.length === 0) throw new Error("Lagocine day page: no film cards found. Has the page layout changed?");

  const showings: RawShowing[] = [];
  cards.each((_, card) => {
    const filmTitle = clean($(card).find(".movie-card__title").text());
    if (!filmTitle) throw new Error("Lagocine day page: a film card has no title.");
    const filmRating = rating($(card).find(".movie-card__meta .badge").first().text());
    $(card).find(".showtimes-data time").each((_, time) => {
      const at = $(time).attr("datetime");
      const cinemaId = $(time).attr("data-cinema-id");
      if (!at || !cinemaId) throw new Error(`Lagocine day page: a showing of "${filmTitle}" has no time or no cinema.`);
      showings.push({
        cinemaId,
        filmTitle,
        rating: filmRating,
        startsAt: lagosOffsetTimeToUtc(at),
        format: clean($(time).attr("data-format")),
        bookingUrl: clean($(time).attr("data-booking")),
      });
    });
  });
  return { showings, builtAt: builtAt($) };
}

/** https://lagocine.com/cinema/<cinema-id>/ The page does not repeat its cinema's id, so the caller gives it. */
export function parseLagocineCinema(html: string, cinemaId: string): ParsedPage {
  const $ = cheerio.load(html);
  const rows = $(".programme-row");
  if (rows.length === 0) throw new Error("Lagocine cinema page: no programme rows found. Has the page layout changed?");

  const showings: RawShowing[] = [];
  rows.each((_, row) => {
    const filmTitle = clean($(row).find(".programme-row__title").text());
    if (!filmTitle) throw new Error("Lagocine cinema page: a programme row has no title.");
    const filmRating = rating($(row).find(".programme-row__meta .badge").first().text());
    // Only the time chips are showings; the "NEXT 15:50" label repeats one of them.
    $(row).find(".programme-row__times [data-showtime]").each((_, chip) => {
      const at = $(chip).attr("data-starts-at");
      if (!at) throw new Error(`Lagocine cinema page: a showing of "${filmTitle}" has no time.`);
      showings.push({
        cinemaId,
        filmTitle,
        rating: filmRating,
        startsAt: lagosOffsetTimeToUtc(at),
        format: clean($(chip).attr("data-format")),
        bookingUrl: clean($(chip).attr("href")),
      });
    });
  });
  return { showings, builtAt: builtAt($) };
}
