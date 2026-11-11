# Spec

Written 6 Nov 2026. What the site does this week, precisely enough to build and test. Decisions are cited as D-xx. Look and copy live in `design/UI-BRIEF.md`; the data format lives in `DATA.md`.

## Goal

Someone in Lagos opens one page on their phone and, in under 20 seconds, finds a film starting in the next two hours in their area, sees where the time came from and how fresh it is, knows whether to stay for the credits, and books on the cinema's own site or adds a reminder.

## Users

- **Primary:** Chime, in Lagos, on an iPhone, deciding on a film after work.
- **Also:** a friend on a mid-range Android on mobile data; a parent looking for a kids' film; a Marvel fan asking about credits scenes.
- **Portfolio audience:** designers and engineers reading the repo and case study.

## Non-goals (this week)

Accounts, ticket sales, ads, push notifications (D-11), group plans, crowd confirmations, other cities, posters from cinema sites (D-08).

## 1. Core flows

1. **Tonight near me:** open the site → a returning visitor lands on their area's page; a first visit sees all of Lagos with the area picker (D-18) → "Starting soon" lists showings in the next 2 hours → tap Book → cinema's site in a new tab. Nothing soon in the area → the empty state offers neighbouring areas (D-22).
2. **One film, anywhere:** type in the "Now showing" filter on home, or tap a film (D-22) → every showing in Lagos by start time, grouped by area → Stay or Go chip → Book or Remind me.
3. **One cinema:** tap a cinema → today and tomorrow → address and source line.
4. **Remind me:** tap Remind me → .ics downloads → phone calendar adds the event with a 30-minute alert. The page shows a live countdown.
5. **Share:** tap Share → native share sheet (or WhatsApp link) with "Sinners · Filmhouse Lekki · Fri 19:30" and the page URL.
6. **Old data:** the source was read 30 hours ago → every row from it says "Read yesterday at 15:06 · check with the cinema" and a banner explains.

## 2. Data model (`src/lib/data/types.ts`, matches `DATA.md`)

| Type | Holds | Notes |
| --- | --- | --- |
| `Cinema` | `id`, `name`, `chain`, `area` (slug), `address?`, `geo?` (`lat`, `lng`), `website?`, `bookingHost?`, `screens?` (`Screen[]`), `sourceIds[]` | From `data/cinemas.json`. Unknown fields are `null`, never guessed |
| `Screen` | `id`, `name`, `formats[]` (`2D`, `3D`, `IMAX`, `4DX`, `MX4D`, `premium`) | Optional this week; only when a source lists it |
| `Film` | `id` (slug), `title`, `runtimeMin?`, `rating?` (NFVCB or source rating text), `origin?` (`nollywood`, `hollywood`, `other`), `tmdbId?`, `credits?` (`CreditsInfo`) | Title from the source; TMDB match at build time |
| `Showing` | `id`, `filmId`, `cinemaId`, `screenId?`, `startsAt` (UTC ISO), `format?`, `language?`, `price?` (`amountNgn`, `label`), `bookingUrl?`, `sourceId`, `fetchedAt` (UTC ISO) | `bookingUrl` null when the cinema has no booking page ("Tickets at the cinema") |
| `Source` | `id`, `name` ("Filmhouse's site"), `owner`, `url`, `method` (`permission-feed`, `public-page`, `api`, `fixture`), `status` (`cleared`, `pending`, `refused`, `do-not-use`), `fetchedAt`, `lastOkAt`, `health` (`ok`, `suspect`, `failing`) | From `data/sources.json` + run results |
| `CreditsInfo` | `during` (`yes`, `no`, `unknown`), `after` (`yes`, `no`, `unknown`), `confidence` (`confirmed`, `likely`, `unknown`), `sources[]` (`name`, `url`, `checkedAt`), `count?` | D-10. `no` needs a source that says so |

## 3. Time and state (`src/lib/time/`) (D-05, D-06)

- `toLagos(iso)` → parts in Africa/Lagos; `formatTime(iso)` → "19:30"; `formatDay(iso, now)` → "Today", "Tomorrow", "Sun 8 Nov".
- `showingState(startsAt, now)`: `upcoming` (> 10 min ahead), `starting` (0–10 min ahead), `started` (0–30 min after), `ended` (> 30 min after). Ended showings are hidden.
- Bookable only when `upcoming` or `starting` **and** the row's freshness band is not Old or Sample (DATA §Freshness defines this, D-25).
- `countdown(startsAt, now)`: "Starts in 1 h 20 min", "Starts in 45 min", "Starts in 3 min", "Starting now", "Started 5 min ago".
- The evening "day" runs to 04:00 Lagos time: a 00:30 show on Saturday morning appears under Friday's "Later tonight" as "00:30 (Sat)".

## 4. Pipeline

`scripts/refresh.ts` runs each **cleared** source in `data/sources.json` (or fixtures with `--fixtures`):
1. **Fetch** politely (D-08): robots check, 5 s gap per host, user agent with contact URL, 20 s timeout, no retries beyond one.
2. **Parse** to raw rows with a per-source parser (`scripts/sources/<id>.ts`), tested against fixtures.
3. **Normalise**: local times → UTC (one tested function), film titles → film slugs (strip format suffixes like "(IMAX)"), cinema names → `cinemaId` from the registry.
4. **Validate** (`lib/data/validate.ts`): schema, no duplicate (`cinemaId`, `filmId`, `startsAt`), every showing has `sourceId` and `fetchedAt`, counts per source vs last run (a drop over 60% marks the source `suspect` and keeps its last good rows, labelled with their real age).
5. **Credits**: `scripts/tmdb.ts` matches new films (with `data/tmdb-overrides.json`), merges `data/credits-manual.json`, and writes `data/credits.json` (cached; re-checked weekly) (D-19, D-25).
6. **Write** `data/showtimes.json` and the per-area files (DATA §Per-area files) only if they changed; the workflow commits them and the host rebuilds.

With `--fixtures`, step 1 reads saved fixtures instead, and step 3 moves their dates onto today and tomorrow in Lagos (D-20). Committed fixtures are cut down to listing markup (D-24).

## 5. Screens

Details, copy and test IDs are in `design/UI-BRIEF.md`.

| Route | Purpose |
| --- | --- |
| `/` | All of Lagos: Starting soon, Later tonight, Tomorrow; "Now showing" film list with a filter box; filters. Sends a returning visitor to their saved area (D-18) |
| `/film/[slug]` | Every showing for one film; Stay or Go; Remind me; Share |
| `/cinema/[id]` | One cinema: today and tomorrow, address, source and last read |
| `/area/[slug]` | The "Starting soon near you" page for one area: same sections as `/`, that area's cinemas, neighbouring areas in the empty state (D-18, D-22) |

The static HTML of `/` and `/area/[slug]` holds one time-ordered list with absolute times. The client regroups it by `now` and hides ended showings (D-18).
| `/about` | How it works, sources and their status, TMDB notice and logo, takedown, privacy |

## 6. Interactions

- Area picker is a list of areas with cinema counts; choice stored in `localStorage` (`ls.area`).
- "Use my location" (Should): on tap, `getCurrentPosition` with a 10 s timeout, low accuracy; nearest area by haversine to cinema `geo`; store only the slug. Denied → "No problem. Pick your area." 
- Book opens the cinema's site in a new tab (`rel="noopener"`). No Book link → "Tickets at the cinema".
- Remind me downloads `<film>-<cinema>-<time>.ics`: `DTSTART` in UTC, `DURATION` from runtime or 2 h, `VALARM` 30 min before, `LOCATION` cinema name and address, `DESCRIPTION` with booking URL and source line.
- Relative text updates every 30 s while the tab is visible; stops when hidden.

## 7. Accessibility

- Semantic list of showings; each row reads as one sentence: "Sinners, Filmhouse Lekki, today at 19:30, starts in 45 minutes. Read from Filmhouse's site 2 hours ago."
- Visible focus; 44 px targets; colour never the only signal (freshness and credits are words).
- Works at 200% zoom and 320 px wide; respects `prefers-reduced-motion` and `prefers-color-scheme`.
- `lang="en-NG"`; times in `<time datetime>`.

## 8. Acceptance checks

- [x] 1. With the clock at Fri 6 Nov 2026 18:00 Lagos, `/area/lekki` on the test fixtures lists only showings starting 18:00–20:00 under Starting soon, sorted by time. verify: `npm run test:e2e -- home`
- [ ] 2. A showing at 17:59 shows "Started 1 min ago" and has no Book link. verify: `npm run test:e2e -- started` and `npm test -- lib/time/showingState`
- [x] 3. Every row has a freshness line; a source read 30 h ago shows the stale wording and the banner. verify: `npm run test:e2e -- freshness`
- [ ] 4. The film page for a TMDB film tagged `aftercreditsstinger` shows "Stay: scene after the credits · TMDB"; an untagged film shows "Credits scene: not known yet"; "Go" shows only for a film with a manual entry that has a link (D-19). verify: `npm test -- lib/wording/credits` and `npm run test:e2e -- film`
- [ ] 5. The .ics file parses (RFC 5545), has `DTSTART:20261106T183000Z` for a 19:30 Lagos show and an alarm at `-PT30M`. verify: `npm test -- lib/ics`
- [x] 6. With the device zone set to America/New_York in Playwright, times still show Lagos time. verify: `npm run test:e2e -- timezone`
- [ ] 7. Home and area pages are within the budget set on Day 0 (D-21); Lighthouse mobile ≥ 90 performance and accessibility. verify: `npm run build && npm run budget`, plus a Lighthouse run with the scores written in `PROGRESS.md`
- [ ] 8. `/about` lists every source with status, the TMDB logo and notice, and a takedown contact. verify: `npm run test:e2e -- about`
- [x] 9. With fixtures active, a "Sample data" banner shows on every page and no row has a booking link. verify: `npm run test:e2e -- sample`
- [ ] 10. `npm run refresh -- --fixtures` run on any day writes showings dated today and tomorrow in Lagos with the fixtures' wall-clock times (D-20). verify: `npm test -- scripts/refresh`
- [x] 11. Typing part of a film's title in the "Now showing" filter on home leaves only matching films, and tapping one opens its film page (D-22). verify: `npm run test:e2e -- films`
- [x] 12. An area with no showing in the next 2 hours shows the empty state with its neighbouring areas and their counts (D-22). verify: `npm run test:e2e -- empty`
- [x] 13. A returning visitor with a saved area who opens `/` lands on `/area/<slug>` (D-18). verify: `npm run test:e2e -- home`

## 9. Risks and assumptions

- No source is cleared by Day 7, so the site launches as a demo (tier C, D-23) — cheapest test: the Day 0 audit of robots and terms for each source.
- Next.js's own JS is larger than D-12 assumed — cheapest test: build the empty scaffold on Day 0 and measure (D-21).
- Most films in cinemas have no TMDB credits tag, so most chips read "not known yet" — cheapest test: run `scripts/tmdb.ts` on the first fixture's film list on Day 2 and count.
- Filmhouse's times are drawn by script and cannot be read without permission (inferred) — cheapest test: one manual page view in the Day 0 audit.
- TMDB title matching picks the wrong film — cheapest test: review every match by eye on Day 2; overrides file (D-25).
- Vercel Hobby may not deploy bot commits on a private repo — cheapest test: look it up before choosing the host (O-8).

## 10. Open questions

- Final name (O-1) — owner: Chime
- Host (O-4, O-8) — owner: Chime
- Coverage and launch tier (O-5, D-23) — owner: Chime, on Day 2
- Budget numbers (O-9) — owner: Claude measures, Chime confirms
- Neighbouring areas list (O-10) — owner: Chime
