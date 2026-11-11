# CLAUDE.md — Lagos Showtimes

**Lagos Showtimes** is the working title (brand open, O-1; the PRD recommends "Wetin Dey Show"). You are building this project. Read this file first, then `docs/HANDOFF.md` (the latest session summary), `docs/PLAN.md` for the current day and `PROGRESS.md` for where the last session stopped.
Every product and architecture decision so far is in `docs/DECISIONS.md`. Don't reopen one unless it blocks you. If it does, write the problem under "Open" in `docs/DECISIONS.md` and ask Chime. Chime is they/them.

## What we are building

A **web app** that shows every Lagos cinema's showtimes in one place, fast on a phone. One line: **"What's starting soon near me, and should I stay after the credits?"**

- Home is **Starting soon near you**: showings in the next 2 hours in your area, then later tonight. Each area has its own static page (`/area/[slug]`); `/` is all of Lagos and sends a returning visitor to their area (D-18).
- Film page: every showing in Lagos by start time and area. Cinema and area pages.
- **Stay or Go** chip: whether a film has a mid- or post-credits scene, with its source and how sure (D-10).
- **Every showing says where it came from and how fresh it is**, in words: "Read from Filmhouse's site 2 hours ago" (D-04).
- Reminder: add to calendar (.ics) and a live countdown. Booking always goes to the cinema's own site.
- Primary user: Chime in Lagos (UTC+1, no DST), on an iPhone; also a mid-range Android on mobile data.
- Research and the full idea: `docs/PRD.md`, `docs/RESEARCH.md`. Spec: `docs/SPEC.md`. Data format: `docs/DATA.md`.

## Project frame (D-01)

- **Portfolio project, built in about one week** with Claude Code. Case study on chimexd.work next to Meridian.
- **The repo is public from Day 0** (D-30, supersedes "private until launch day"), open source (MIT). Everything committed is public at once: no personal addresses, no keys, no full saved cinema pages (D-24).
- **Budget is $0.** Free host (Vercel Hobby or Cloudflare Pages, O-4), free GitHub Actions, free TMDB API (non-commercial). No paid services, no domains unless Chime says so.
- **Scope** is the Must / Should / Cut table in `docs/PLAN.md`. If a day overruns, cut its Should items. Never cut Day 7 (README, case study, public repo).
- **Design comes first** (D-13). Day 1 runs the design phase: references, three directions, Chime picks one, then `docs/design/UI-BRIEF.md` is completed. After that the site is the source of truth.
- **Data permission comes first** (D-07, D-08). Nothing fetches a real site on a schedule until that source is cleared in `data/sources.json`. Until then, build from saved fixtures.
- **Chime builds Tactics Board (Agmen) at the same time.** The Mac is tight on memory: one dev server at a time, stop it when you finish, and never leave Playwright browsers or watchers running.

## Stack (fixed, D-02)

- **Next.js 16.4.3** App Router, **static export** (`output: "export"`), **React 19.3.1**, **TypeScript 5.9.3** (strict), **Tailwind CSS 4.3.3** (`@tailwindcss/postcss`). Same versions as Chime's portfolio.
- **ESLint 9** with `eslint-config-next` 16.4.3. **Vitest** for unit tests (D-03). **@playwright/test 1.64.1** for e2e.
- Node 22. npm (not pnpm or yarn).
- Fetch scripts are TypeScript in `scripts/`, run with Node's built-in type stripping (`node scripts/x.ts`); HTML parsing with `cheerio` (dev dependency, scripts only, D-03).
- **No other runtime dependencies** without Chime's OK. No UI kit, no date library: use `Intl.DateTimeFormat` with `timeZone: "Africa/Lagos"`.
- Colours, type and spacing come from tokens in `src/styles/tokens.css`. No hard-coded colours.

## Layout (create as you go)

```
src/
  app/                      routes: / (starting soon), /film/[slug], /cinema/[id], /area/[slug], /about
  components/               ShowingRow, FreshnessLine, StayOrGoChip, AreaPicker, Countdown, CalendarButton
  lib/
    time/                   lagos.ts (UTC <-> Africa/Lagos), showingState.ts, countdown.ts
    wording/                freshness.ts, credits.ts, showing.ts (all user-facing sentences)
    data/                   types.ts (schema v1), load.ts, validate.ts, select.ts (filters, sorting)
    ics/                    ics.ts
  styles/                   tokens.css, globals.css
public/                     manifest.webmanifest, icons, sw.js
scripts/
  sources/                  one fetcher + parser per cleared source
  refresh.ts                run sources -> normalise -> validate -> write data/showtimes.json
  tmdb.ts                   match films, read credits keywords (build time only)
  check-budget.mjs          page-weight budget on the built `out/`
data/                       cinemas.json, sources.json, showtimes.json, credits.json
tests/
  unit/                     Vitest
  e2e/                      Playwright
  fixtures/                 saved HTML/JSON from each source, plus showtimes fixtures
docs/                       PRD, PLAN, SPEC, DATA, DECISIONS, RESEARCH, HANDOFF, OUTREACH, features.json, design/
PROGRESS.md                 build log
```

## Commands

```bash
npm run dev          # next dev (stop it when done)
npm run build        # next build -> out/
npm run lint         # eslint . && node scripts/check-tokens.mjs
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:e2e     # playwright test (builds and serves out/)
npm run budget       # node scripts/check-budget.mjs (after build)
npm run refresh      # node scripts/refresh.ts  (cleared sources only; --fixtures for offline)
```

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` before saying a task is done.

## Rules that protect correctness

1. **Times are stored as UTC ISO 8601 strings** (`2026-11-06T18:30:00Z`) and shown in **Africa/Lagos** with `Intl.DateTimeFormat(..., { timeZone: "Africa/Lagos" })`, whatever the device's zone. 24-hour clock ("19:30"). Never build a `Date` from a local-time string without a zone. Parsers convert the cinema's local time to UTC once, in one tested function.
2. **Every showing carries its source and `fetchedAt`**, and the UI says freshness **in words**, through `lib/wording/freshness.ts` only (D-04): "Read from Filmhouse's site 2 hours ago". Never a coloured dot alone. Data older than the stale limit says so and is never hidden silently (`docs/DATA.md` §Freshness).
3. **Time-relative text is computed in the browser from `now`**, never baked into static HTML ("Starts in 45 min", "Read 2 hours ago"). The static HTML shows absolute times; the client fills the relative words.
4. **A showing that has started is never bookable.** At start time the row says "Started 5 min ago", loses its booking link and drops out of "Starting soon" (D-05). Tests cover the boundary second.
5. **Booking links go to the cinema's own site** (or the booking engine it uses). We never sell, never add tracking parameters, never deep-link to seat maps or checkout pages we were not given.
6. **Respect every source** (D-08): obey robots.txt, at most one request per 5 s per host, a named user agent with a contact URL, only public listing pages, stop the same day if asked. A source runs on a schedule only when `data/sources.json` marks it `cleared`. Never copy posters or synopses from cinema sites.
7. **Credits info says how sure it is, in words, with its source** (D-10), through `lib/wording/credits.ts`: "Stay: scene after the credits · TMDB" for one named source (D-19), "Probably stay" only for an inferred answer, "Not known yet". A missing keyword is **"Not known yet", never "Go"**; "Go" needs a linked entry in `data/credits-manual.json`.
8. **Never invent data.** Unknown price is "Price not listed". Unknown address is left out. Fixtures are real saved pages, labelled as fixtures, and the UI shows a "Sample data" banner while fixtures power it.
9. **Page weight budget** (D-21, supersedes D-12's numbers): set from the Day 0 measurement of the empty app and held in `scripts/check-budget.mjs`. No blocking web fonts. CI fails over budget.
10. **TMDB is build-time only.** The key lives in `.env.local` and GitHub Secrets, never in client code. Attribution and the TMDB notice are on `/about` (D-09).
11. **Location never leaves the device.** "Use my location" runs only on tap, picks the nearest area, and stores only the area slug.

## Working style

- Work day by day from `docs/PLAN.md`. Pass a day's gate before starting the next.
- **Tests first** for `lib/time/`, `lib/wording/`, `lib/data/validate.ts`, `lib/ics/` and every parser in `scripts/sources/`. Fixtures are **saved HTML/JSON samples** in `tests/fixtures/<source>/` with the date saved in the file name. Use a fixed clock in tests (`vi.setSystemTime`), always with UTC instants.
- **Playwright e2e** for the core flows (SPEC §Acceptance) against the built static site, at a phone viewport, with the clock frozen.
- Commit after each green step with a conventional message (`feat:`, `fix:`, `test:`, `chore:`, `docs:`). **Push to GitHub after every commit** (the repo is public, D-30).
- After UI work: build, screenshot at 390×844 and 360×800, and compare with the approved direction before calling the step done. Check on Chime's phone before a gate passes.
- Update the checkbox in `docs/PLAN.md` and the matching item in `docs/features.json` (with evidence) when a task is complete. Log each session in `PROGRESS.md` (newest first) and rewrite `docs/HANDOFF.md` at the end of each session.
- New product or architecture choices get a numbered entry in `docs/DECISIONS.md` (supersede, never edit, old entries).
- Never send emails or contact cinemas yourself. Chime sends `docs/OUTREACH.md` drafts and tells you the replies.
- Keep files under about 300 lines. Accessibility: semantic HTML, visible focus, 44 px targets, `prefers-reduced-motion`, every time readable by screen readers as a full sentence.
