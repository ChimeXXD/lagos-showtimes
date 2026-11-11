# Sinima: the one-week build

Written 6 Nov 2026, revised 11 Nov 2026 after the plan review (`PLAN-REVIEW.md`, D-18 to D-25). Decisions are in `DECISIONS.md`. The PRD is `PRD.md`; this plan replaces its Phase 1 for the week.

## What "done" means

A **portfolio project** (D-01). We build it with Claude Code in one week and ship a **public, open-source repo** and a **live site on a free host**, which Chime features on chimexd.work next to Meridian.

The finished project is:
1. A live web app where someone in Lagos opens one page on their phone and sees what starts in the next 2 hours in their area, with where each time came from and how fresh it is, and books on the cinema's own site.
2. A film page with every showing in Lagos and a Stay or Go answer that says how sure it is.
3. A public repo that reads like senior work: README with screenshots, an architecture diagram (sources → JSON → static pages), the data schema, tests, a CI badge, honest numbers (page weight, Lighthouse, coverage, permission replies).
4. A case study for chimexd.work.

The selling point: **what's starting soon near me, and should I stay after the credits?**

## The week at a glance

Dates are a suggestion; start Day 0 whenever Chime does, and shift the rest.

| Day | Focus | Gate (must pass before the next day) |
| --- | --- | --- |
| 0 | Setup + data-source audit + permission emails | Empty Next.js app builds, lints and deploys privately; CI green; `data/sources.json` audit filled; Chime has sent the outreach emails; empty-app size measured and the budget set (D-21) |
| 1 | **Design direction** + core lane (D-14) | 3 directions on the direction board; **Chime picks one**; name decided (O-1); UI brief §1–3 and tokens. Core lane: time, wording and `.ics` tests green |
| 2 | Data: schema, validator, fixtures, first parser | `showtimes.json` v1 validates; parsers for at least two sources pass on saved fixtures; sample data lands on today's dates (D-20); coverage decision (O-5) and launch tier (D-23) |
| 3 | Home "Starting soon" + area picker | Chime approves home on the phone; a showing in the next 2 hours found in under 20 s |
| 4 | Film, cinema and area pages + Stay or Go | Film page lists every showing; Stay or Go from TMDB with confidence words; started showings never bookable (e2e) |
| 5 | Reminder, share, install, offline | .ics opens in iPhone Calendar and Google Calendar with a 30-min alert; WhatsApp preview card shows; offline banner with data age |
| 6 | Harden | Budget, Lighthouse ≥ 90, accessibility pass, real phones on mobile data; refresh workflow ready (enabled only for cleared sources) |
| 7 | Portfolio and public | Repo public (MIT); README, case study and screen recording done; live URL works |

## Scope for the week

| Must (the demo breaks without it) | Should (if the day has room) | Cut (not this week) |
| --- | --- | --- |
| Schema v1, validator, time and freshness wording, with tests | Kids filter; Nollywood/Hollywood filter | Accounts, logins, favourites synced across devices |
| Home: Starting soon (2 h) + Later tonight, by area | "Use my location" to pick nearest area | Web Push (Phase 2, D-11) |
| Film page, cinema page, area page | Format filter (IMAX, 3D) | Group plan "who's in" (Phase 3) |
| Freshness line on every showing; stale and sample-data banners | Price when listed | Crowd credits confirmations (Phase 3) |
| Started showings not bookable (D-05) | Travel buffer from the user's own estimate | Coming soon calendar (Phase 2) |
| Stay or Go chip from TMDB with confidence words | Data-saver toggle (default from `saveData`) | Abuja, Port Harcourt (O-7) |
| .ics reminder + live countdown | PWA install + offline last data | Ticket sales, commission, ads |
| Booking link to the cinema's own site | WhatsApp preview card image (OG) | Posters from cinema sites |
| Data from fixtures or cleared sources | Refresh workflow live for cleared sources | Native app |
| `/about`: sources, TMDB notice, takedown | "Runs 2 h 10 min · out about 21:40" (D-22) | |
| Page weight budget in CI (D-21); Playwright e2e | "Report a wrong time" link (D-22) | |
| "Now showing" film list with a filter box (D-22) | Share link that opens on the exact showing (D-22) | |
| Neighbouring areas in the empty state (D-22) | | |
| Manual credits file; sample data on today's dates (D-19, D-20) | | |

## Day by day

### Day 0: Setup, audit and ask
- [x] Chime decides the host (O-4: Vercel, D-27). Repo is public from Day 0 (D-30). Originally: create private repo `ChimeXXD/lagos-showtimes` (D-17); first commit of these docs (push it together with the scaffold, so CI's first run has a `package.json`)
- [x] `create-next-app` with the portfolio versions (pin exact: next 16.4.3, react 19.3.1, typescript 5.9.3, tailwindcss 4.3.3, @playwright/test 1.64.1, eslint 9); `output: "export"`; add Vitest and cheerio (D-03)
- [x] Scripts: `lint`, `typecheck`, `test`, `test:e2e`, `build`, `budget`, `refresh`; one Vitest test and one Playwright test pass
- [x] CI (`.github/workflows/ci.yml`) green on `main` (run 42931829240)
- [x] Measure the empty app's transferred size and JS; set the budget from it and log it as a decision (D-21, O-9)
- [x] Private deploy on the chosen host (preview protected or unlisted)
- [x] **Data-source audit**: for each source in DECISIONS O-2, read robots.txt and terms, quote the relevant lines, note the listing URL pattern and how many days ahead it publishes. Fill `data/sources.json` (format in `DATA.md`). Save one listing page per source to `tmp/` by hand-triggered single request, then commit a cut-down copy (listing markup only) to `tests/fixtures/<source>/<date>.html` (D-24)
- [x] **Chime sends the outreach emails** (`docs/OUTREACH.md`): Lagocine first, then Filmhouse, Genesis, EbonyLife, Silverbird, Syticks. Log "Asked" dates in DECISIONS
- [x] TMDB terms read by Claude (D-31); Chime's key is in `.env.local` (11 Nov). Still to do before the scheduled refresh: the GitHub secret `TMDB_READ_TOKEN`

### Day 1: Design direction (D-13) + core lane (D-14)
- [x] Collect 30–50 references by surface (`docs/design/REFERENCES.md`); images stay local
- [x] Pattern summary: what the picks share, what to avoid
- [x] `docs/design/direction-board/index.html`: three directions, each showing Starting soon, a film page with Stay or Go, and a stale-data state, at 390 px wide
- [x] **Chime picks a direction and the name (O-1)**; log both as decisions (D-35: direction B · Poster; D-36: Sinima)
- [x] Fill UI brief §1–3; write `src/styles/tokens.css` (D-37, D-38)
- [x] Logo and icon: Ticket S in Ink and blue (D-42, D-43), in the header, tab, home screen and manifest
- [x] Core lane, tests first: `lib/time/lagos.ts`, `showingState.ts`, `lib/wording/freshness.ts`, `credits.ts`, `lib/ics/ics.ts`

### Day 2: Data
- [x] `lib/data/types.ts` and `validate.ts` from `DATA.md`; the DATA.md example validates; broken fixtures fail with clear messages
- [x] Parsers for two sources, tests first on saved fixtures: Lagocine (the live source from Day 6, D-33) and Veezi (the Silverbird Ikeja fixture). Save and cut down one Lagocine cinema page and one day page first (D-24)
- [x] `scripts/refresh.ts --fixtures` writes `data/showtimes.json` and the per-area files from fixtures, with dates moved onto today and tomorrow (D-18, D-20)
- [x] `scripts/tmdb.ts`: match films, read keywords 179430/179431, write `data/credits.json`; `data/tmdb-overrides.json` and `data/credits-manual.json` merged in (D-19, D-25); report the share of films with an answer
- [x] Draft the neighbouring areas list for Chime to confirm (O-10): the draft is in `DECISIONS.md` under O-10, waiting for Chime
- [x] Decide coverage (O-5) and name the launch tier (D-23): coverage is the 20 cinemas Lagocine lists (D-33); the site is tier C (sample data) today and becomes tier A on Day 6 if Lagocine has not objected
- [ ] Update `data/cinemas.json` (coordinates, addresses from the cinemas' own pages): not started; it needs pages that have not been saved

### Day 3: Home
- [x] `/area/[slug]` as the static "Starting soon near you" page and `/` for all Lagos (D-18): next 2 hours, then Later tonight, then Tomorrow
- [x] Area picker (remembered; `/` sends a returning visitor to their area); empty state with neighbouring areas (D-22)
- [x] "Now showing" film list on home with a filter box (D-22)
- [x] Showing row: time, film, cinema, format, freshness line, Book link
- [x] Sample-data and stale banners
- [ ] Chime approves home on the phone; screenshot saved

### Day 4: Film, cinema, area, Stay or Go
- [ ] Film page: all showings by start time, grouped by area; Stay or Go chip
- [ ] Cinema page: today and tomorrow, address, source, last read
- [ ] Area page
- [ ] e2e: a showing at `now − 1 min` shows "Started" with no Book link
- [ ] Filters (Should): kids, Nollywood/Hollywood, format
- [ ] "Runs … · out about …" on the film page when runtime is known (Should, D-22)
- [ ] "Report a wrong time" link (Should, D-22)

### Day 5: Reminder, share, install
- [ ] "Remind me" downloads an .ics with a 30-min alert; check on iPhone Calendar and Google Calendar (Android)
- [ ] Countdown on the chosen showing ("Starts in 45 min")
- [ ] Share: Web Share API with WhatsApp text fallback; the link opens on the exact showing (Should, D-22); OG preview card per film (Should)
- [ ] Service worker, network-first (D-25; the manifest and icons were done on Day 1 with the logo): offline shows last data with its age (Should)

### Day 6: Harden
- [ ] Budget check and Lighthouse ≥ 90 (mobile) on home and film pages
- [ ] Accessibility: keyboard, VoiceOver, TalkBack, 200% zoom, reduced motion
- [ ] Real phones on mobile data: Chime's iPhone and a mid-range Android; note real load times
- [ ] Refresh workflow: if Lagocine has not objected, Chime confirms it as `cleared` and the schedule goes on (D-33); otherwise leave it disabled and say so in the README
- [ ] `/about` complete: sources, TMDB logo and notice, takedown

### Day 7: Portfolio and public
- [ ] Rename repo to the chosen name if needed (D-17)
- [ ] README: screenshots, what it does, architecture diagram, data schema link, how to run, honest numbers, permission status, the launch tier reached (D-23)
- [ ] Case study draft in `docs/CASE-STUDY.md` for chimexd.work
- [ ] 30-second screen recording of "find a film tonight"
- [ ] Make the repo public; CI on every push and pull request
