// Parser for a Veezi sessions page (ticketing.eu.veezi.com/sessions/?siteToken=...), the booking
// engine Silverbird uses. Its dates carry no year ("Wednesday 11, November") and its times are on
// a 12-hour clock ("6:35 PM"), so the caller says which day the page was read.
import * as cheerio from "cheerio";
import { lagosLocalToUtc } from "../../src/lib/time/lagos.ts";
import { clean, type ParsedPage, type RawShowing } from "./raw.ts";

type Day = { year: number; month: number; day: number };

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DATE = /^([A-Za-z]+) (\d{1,2}), ([A-Za-z]+)$/;
const TIME = /^(\d{1,2}):(\d{2}) (AM|PM)$/i;
/** Veezi's placeholder for a film not yet classified. */
const NOT_RATED = "TBC";

/**
 * "Wednesday 11, November" as a full date. A listing only looks ahead, so a date earlier in the
 * year than the day the page was read belongs to next year. The weekday must then agree.
 */
function fullDate(text: string, readOn: Day): Day {
  const found = DATE.exec(text);
  const month = found ? MONTHS.indexOf((found[3] as string).toLowerCase()) + 1 : 0;
  if (!found || month === 0) throw new Error(`Veezi page: cannot read the date "${text}"`);
  const day = Number(found[2]);
  const isBefore = month < readOn.month || (month === readOn.month && day < readOn.day);
  const year = isBefore ? readOn.year + 1 : readOn.year;
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  if (weekday !== (found[1] as string).toLowerCase()) throw new Error(`Veezi page: "${text}" is not a ${found[1]} in ${year}`);
  return { year, month, day };
}

/** "6:35 PM" to 18:35; "12:05 AM" is five past midnight. */
function clock(text: string): { hour: number; minute: number } {
  const found = TIME.exec(text);
  const hour12 = found ? Number(found[1]) : 0;
  const minute = found ? Number(found[2]) : 60;
  if (!found || hour12 < 1 || hour12 > 12 || minute > 59) throw new Error(`Veezi page: cannot read the time "${text}"`);
  const isPm = (found[3] as string).toUpperCase() === "PM";
  return { hour: (hour12 % 12) + (isPm ? 12 : 0), minute };
}

export function parseVeeziSessions(html: string, options: { cinemaId: string; readOn: Day }): ParsedPage {
  const $ = cheerio.load(html);
  const films = $("#sessionsByDateConent .film");
  if (films.length === 0) throw new Error("Veezi page: no films found. Has the page layout changed?");

  const showings: RawShowing[] = [];
  films.each((_, film) => {
    const filmTitle = clean($(film).find("h3.title").text());
    if (!filmTitle) throw new Error("Veezi page: a film has no title.");
    const censor = clean($(film).find(".censor").first().text());
    $(film).find(".date-container").each((_, container) => {
      const date = fullDate(clean($(container).find("h4.date").text()) ?? "", options.readOn);
      $(container).find(".session-times li").each((_, session) => {
        showings.push({
          cinemaId: options.cinemaId,
          filmTitle,
          rating: censor === NOT_RATED ? null : censor,
          startsAt: lagosLocalToUtc({ ...date, ...clock(clean($(session).find("time").text()) ?? "") }),
          format: null,
          bookingUrl: clean($(session).find("a").attr("href")),
        });
      });
    });
  });
  return { showings, builtAt: null };
}
