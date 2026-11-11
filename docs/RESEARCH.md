# Research

The market research, competitors and sources are in `PRD.md` (6 Nov 2026). This file holds technical notes and findings that didn't fit there. Add new findings with a date and a link to a page you actually opened. Mark anything from memory as "(from memory, unverified)".

## How each source publishes (6 Nov 2026)

| Source | What we saw | Notes for the parser |
| --- | --- | --- |
| Lagocine | Static pages: `/cinema/<id>/`, `/area/<slug>/`, `/day/<yyyy-mm-dd>/`, `/movie/<slug>/`, sitemap with 89 URLs, all `lastmod` 2026-11-06. A build stamp meta `lagocine-built: 2026-11-06T15:08:28+01:00`. Hosted on Cloudflare. | If Lagocine agrees, ask for a JSON export rather than parsing HTML. Its "last read" times map straight onto our `via.fetchedAt`. |
| Filmhouse | Booking links per film, date and site: `filmhouseng.com/movies/<film-slug>/showtimes/<yyyy-mm-dd>/<site>/select-tickets?showtime=<base64 id>`. Site slugs seen: `lekki`, `surulere`, `circlemall`, `ikota`, `palmslekki`, `oniru`, `landmark`. Home page showed 8 films and no times in fetched text (likely rendered by script). | Look for a JSON call behind the showtimes page in the Day 0 audit (browser network tab, one manual visit). Do not call private endpoints without permission. |
| Genesis | `genesiscinemas.com/<site>/booknow/<id>`; sites `lekki-purple`, `festival-mall-festac`, `maryland-mall-maryland`. 12 locations, 47 screens nationally. | Audit robots and terms first. |
| EbonyLife | `ebonylifecinemas.com/movies/<uuid>?showTimeId=<uuid>&showtimeDate=<date>`. | UUIDs suggest an API behind the page. Ask before using it. |
| Silverbird | Veezi: `ticketing.eu.veezi.com/sessions/?siteToken=<token>` and `/purchase/<id>?siteToken=<token>`. The Galleria page said "No shows currently scheduled". | Veezi sessions pages are server-rendered HTML with "Sort by film" and "Sort by date". Veezi is a Vista Group product (from memory, unverified). |
| Syticks | `GET https://api.syticks.com/api/v1/merpi/experience?cinema=true`, `cinema_info` with `times`, `days_with_times`, `locations`. No key shown in examples. | Ask before use; check which Lagos cinemas sell through it. |
| Showtimes NG | robots.txt: `search=yes, ai-train=no, use=reference`; blocks GPTBot, ClaudeBot, CCBot and others. | Do not use. |

## Earlier Lagos showtimes products

- **Now Showing** (launched 11 Nov 2015, founder Iruafemi Joseph): Now, Next, Today, Tomorrow filters; offered an API to other sites. Our "Starting soon" is the same instinct; it shows the need is old.
- **Kolanuts.ng** (launched 8 Sep 2016): Lagos, Abuja, Port Harcourt; IMDb and RT ratings; watchlist with notifications. Not around today.
- Lesson: keep running costs at zero and give people a reason to return (reminders, credits answers).

## Time handling

- Lagos is `Africa/Lagos`, UTC+1, no DST (from memory, unverified; consistent with Meridian's notes). Still display through `Intl` with the zone set, never with a fixed `+1` offset in display code.
- Parsers get local wall times ("19:30" on a date page). Convert with one function: `lagosLocalToUtc("2026-11-06", "19:30") -> "2026-11-06T18:30:00Z"`. Tests cover midnight shows ("00:30" on the Friday page may mean Saturday early hours; check per source).
- In Playwright, set `timezoneId: "America/New_York"` for one test to prove display ignores the device zone.

## Web platform notes

- **Web Push on iPhone:** iOS/iPadOS 16.4+, only for Home Screen web apps with a manifest `display` of `standalone` or `fullscreen`; permission must follow a tap; uses Push API, Notifications API and service workers; no Apple Developer membership needed; allow `*.push.apple.com` ([WebKit](https://webkit.org/?p=13878)). Sending at a set time needs a server or a scheduled job plus stored subscriptions, hence Phase 2 (D-11).
- **Android:** Chrome supports install prompts (`beforeinstallprompt`) and Web Push without install (from memory, unverified).
- **.ics** is the dependable reminder: one file, works with iPhone Calendar and Google Calendar. Use UTC `DTSTART` with `Z`, CRLF line endings, line folding at 75 octets, a `UID`, `DTSTAMP`, and `VALARM` with `TRIGGER:-PT30M` (RFC 5545, from memory). Serve as `text/calendar` from a client-side Blob (static site).
- **Geolocation** needs HTTPS and a user gesture is good practice; use `enableHighAccuracy: false`, `timeout: 10000`, `maximumAge: 600000`.
- **Offline:** a small hand-written service worker: cache-first for the app shell, network-first for `showtimes.json` with the cached copy as fallback, and show its age.
- **Data saver:** `navigator.connection.saveData` is Chromium-only (from memory); default posters off when true, and give everyone a toggle.
- **Page weight:** 1 GB floor price rose to ₦431.25 in Jan 2025 ([Leadership](https://leadership.ng/higher-tariff-forces-many-nigerians-to-reduce-data-usage)). At 150 KB a first visit costs well under ₦0.10 of data at that floor; posters would multiply it.

## Hosting and schedule

- **Vercel Hobby:** free, personal and non-commercial only; 100 GB fast data transfer, 1M CDN requests, 100 deployments a day ([Vercel](https://vercel.com/docs/plans/hobby)). A data commit a few times a day is fine.
- **Cloudflare Pages:** free static hosting (from memory, unverified; Lagocine runs on Cloudflare per its privacy page).
- **GitHub Actions schedule:** UTC by default, optional `timezone:` since March 2026, minimum every 5 minutes, delays at the top of the hour, disabled after 60 days without activity in a public repo ([Cronuru](https://cronuru.com/guides/github-actions-scheduled-workflows)). Use an odd minute (e.g. `17 5,11,15 * * *` UTC = 06:17, 12:17, 16:17 Lagos).
- **Node type stripping:** Node 22.18+ runs `.ts` files directly (from memory, unverified). Day 0 checks `node --version`; if it fails, use `tsx` (needs Chime's OK).

## TMDB

- Keywords `aftercreditsstinger` and `duringcreditsstinger` exist (named in the Kodi Stinger add-on README). IDs 179430 and 179431 per Raymond Camden (Mar 2026). Read them with `GET /3/movie/{id}?append_to_response=keywords`; the list is at `keywords.keywords`.
- Search (`/3/search/movie`) does not return keywords; match by title and year, then fetch details.
- Terms: free non-commercial with attribution and logo; notice text required in About or Credits ([FAQ](https://developer.themoviedb.org/docs/faq)). Full API terms page not readable by our fetcher (O-6). Rate limits not checked.
- Nollywood titles may be missing or untagged (assumption). Measure the share of films with a credits answer and publish it.

## Credits sources we only link to

- RunPee "Anything Extra": free, donation-supported, 4.8 from 546 ratings.
- What's After The Credits: colour plus asterisk legend, RSS feed, no API; "All names, trademarks and images are copyright their respective owners."
- MediaStinger: last updated 2016.

## Not verified

- Filmhouse robots.txt and terms; Genesis, EbonyLife and Veezi terms.
- Whether Filmhouse or Genesis have current native apps.
- Google's showtimes cards for Lagos cinemas.
- Ticketing platforms' Lagos cinema coverage (Nairabox, Syticks, others).
- TMDB API rate limits and caching rules.

## Source audit findings (11 Nov 2026)

One manual request per page, with the named user agent. Full quotes are in `data/sources.json`.

- **Veezi (Silverbird Ikeja):** `ticketing.eu.veezi.com/sessions/?siteToken=9chn7w68550a7sxgexpdng2ndm`. Server-rendered. Structure: `#sessionsByDateConent > .date > h3.date-title` then `.film` blocks with `h3.title`, `span.censor`, and `ul.session-times li a[href*="/purchase/"] time`. Dates have no year ("Wednesday 11, November"); times are 12-hour ("10:40 AM"). Full programme for today and tomorrow, plus a few advance dates.
- **Filmhouse:** listing pattern `/movies/<film-slug>/showtimes/<yyyy-mm-dd>?location=all` (from the sitemap and a film page). The page is a skeleton: no times and no booking links in the HTML. robots.txt disallows `/api/`.
- **EbonyLife:** a static shell; its embedded page data is empty.
- **Lagocine:** `/cinema/<id>/` and `/day/<yyyy-mm-dd>/` are static HTML with times, ratings and addresses in the page.
- **Genesis:** the home page HTML lists `/<site>/booknow/<id>` links for every location.
- **TMDB terms:** non-commercial only; cache for at most 6 months; logo and notice required (D-31).
