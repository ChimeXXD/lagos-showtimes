# Plan review and refined plan

Written 11 Nov 2026 after reading every file in the folder. Nothing in `DECISIONS.md`, `PLAN.md`, `SPEC.md` or `DATA.md` has been changed. This file proposes changes; each becomes a numbered decision only when Chime says yes.

Labels: **Verified** (checked today), **Inferred** (reasoned, not checked), **Unknown**.

## 1. What we are building

A phone-first web app that answers one evening question for Lagos: **"What starts in the next two hours near me, and should I stay after the credits?"**

- Home lists showings starting soon in your area, then later tonight, then tomorrow.
- Film, cinema and area pages. Booking always goes to the cinema's own site.
- Every showing says where its time came from and how old it is, in words.
- Stay or Go: whether a film has a credits scene, with its source and how sure.
- Reminder by calendar file (.ics) and a live countdown.
- A portfolio project: about one week, $0, private until launch day, then public (MIT) with a case study.

The opening against Lagocine (which already covers 20 cinemas honestly) is **time and place first**, plus the credits answer.

## 2. How we are building it

| Layer | Choice | Source |
| --- | --- | --- |
| Framework | Next.js 16.4.3 App Router, static export | D-02 |
| UI | React 19.3.1, TypeScript 5.9.3 strict, Tailwind 4.3.3, tokens only | D-02 |
| Data | JSON files in the repo; pages build from them | PRD |
| Refresh | GitHub Actions on a schedule: fetch, parse, validate, commit; host rebuilds | D-08 |
| Film data | TMDB at build time only | D-09 |
| Tests | Vitest (unit), Playwright (e2e), page-weight budget in CI | D-03, D-12 |
| Host | Vercel Hobby or Cloudflare Pages | O-4, open |
| Server, accounts, analytics, cookies | None | D-15 |

**Verified today:** every pinned version exists on npm (next 16.4.3, react 19.3.1, typescript 5.9.3, tailwindcss 4.3.3, @playwright/test 1.64.1, eslint-config-next 16.4.3). `gh` is logged in as ChimeXXD. The folder is not yet a git repository. This Mac runs Node 24.12.0, while the docs and CI say Node 22; add an `.nvmrc` or accept 24 locally.

## 3. What will not work as written

Ordered by how much damage each does if we find it late.

### 3.1 Sample data plus the real clock gives an empty app
Fixtures are saved once (Day 0). The client hides showings that ended. By Day 3 every fixture showing has ended, so the home page Chime is meant to approve on the phone shows nothing, and the launch-day demo is blank if no source is cleared.
**Fix:** `refresh --fixtures` keeps each fixture's wall-clock times and moves its dates onto today and tomorrow. The "Sample data" banner and "Sample only" buttons already say these are not for booking. Tests keep using a frozen clock.

### 3.2 The page-weight budget does not add up
- D-12 says home ≤ 150 KB, of which JS ≤ 90 KB and `showtimes.json` ≤ 60 KB. If home loads the JSON, 90 + 60 = 150, leaving nothing for HTML and CSS.
- **Inferred, from memory:** an empty Next.js App Router page ships roughly 100 KB of gzipped JS before we write a line. If so, the 90 KB limit fails on Day 0.
**Fix:** on Day 0, build the empty scaffold and measure. Then set the budget from that number (baseline plus a fixed allowance for our code). Keep 150 KB only if the measurement says it is reachable.

### 3.3 The home page cannot be static and personal at once
The area lives in `localStorage`, which the static HTML cannot see. So "static HTML shows the list, the client fills in relative words" (UI brief §6) is not possible for `/` as specified. The "Starting soon / Later tonight" split also depends on `now`.
**Fix (recommended):** build one static page per area, and make `/area/[slug]` the real "Starting soon" page with a plain time-ordered list in the HTML. The client regroups it into Soon, Later and Tomorrow. `/` shows all of Lagos the same way, and sends a returning visitor to their saved area. This also splits the data by area, which helps 3.2.

### 3.4 Data permission is the critical path, and five days have passed
The emails in `OUTREACH.md` were due on 6 Nov and have not gone. Chains rarely answer in a week. Two sources have extra problems:
- **Filmhouse** (7 of 22 cinemas, 28% of the 2024 market): its pages showed no times in fetched text, so they are drawn by script. cheerio cannot read them, and `RESEARCH.md` says not to call private endpoints without permission. **Inferred:** without a yes from Filmhouse or Lagocine, Filmhouse is out.
- **Lagocine:** we would be building a rival view on a competitor's data. A "no" is a reasonable answer. The wording "From Lagocine, which read EbonyLife's site 2 hours ago" also needs Lagocine to give us its per-cinema read times.

**Fix:** treat the Day 0 audit (robots and terms), not the emails, as the route to real data this week, since D-08 already allows clearing a source that way. And name the launch tiers now, so Day 7 is honest whichever one we reach:

| Tier | Data on launch day | What the site says |
| --- | --- | --- |
| A | Lagocine feed (about 20 cinemas) | Live |
| B | One or more sources cleared by robots and terms (Silverbird's Veezi pages are server-rendered, so most likely) | Live for those cinemas; the rest listed as "not covered yet" |
| C | Nothing cleared | A demo on sample data, said plainly in the README and on the site |

### 3.5 The credits wording contradicts itself, and "Stay" is unreachable
- `DATA.md` says one source gives "**Probably stay**", and plain "Stay" needs two sources. `SPEC.md` check 4 and CLAUDE.md rule 7 say a TMDB tag gives "**Stay**: scene after the credits · TMDB".
- TMDB is the only machine-readable source (D-10: RunPee and aftercredits.com are link-only). So two-source "Stay" never happens.
- **Inferred:** films in cinemas are new and about half are Nollywood, so most film pages will read "Not known yet". The headline feature would be mostly blank.

**Fix:** (a) a TMDB tag is a person's positive statement, so one named source gives "Stay: scene after the credits · TMDB"; keep "Probably" for anything we infer. (b) Add `data/credits-manual.json`: Chime's own entries with a link and a date, which D-10 already permits. Ten minutes a week covers the ten biggest films and is the only way "Go" ever appears. (c) Publish the real share of films with an answer.

### 3.6 Raw fixtures cannot go into a public MIT repo
Rule 6 says never copy posters or synopses from cinema sites. A saved listing page contains exactly those, and the repo goes public on Day 7.
**Fix:** commit fixtures cut down to the listing markup the parser reads (titles, times, links), with a note of what was removed. Keep the full saved pages in the git-ignored `tmp/`.

### 3.7 There is no way to find a film
SPEC flow 2 starts "search or tap a film", but no route, screen, plan item or feature covers search or a list of films now showing. A film that is not starting soon in your area cannot be reached.
**Fix:** a "Now showing" list of films on home (below the showings) with a filter-as-you-type box. No new route needed.

### 3.8 Most areas have one cinema
**Verified** from `data/cinemas.json`: Lekki 6, Victoria Island 4, Ikeja 2, Surulere 2, and eight areas with one cinema each. "Starting soon in Festac" will often be empty.
**Fix:** a small hand-written list of neighbouring areas. The empty state then offers "Nearest: Surulere, 3 showings soon". No distances or travel times, so D-16 holds.

### 3.9 Smaller gaps
- **Freshness bands have a hole.** `DATA.md` lists "1–5 h" then "≥ 6 h". An age of 5 h 30 min is undefined. Proposal: hours band runs to under 6 h.
- **"Bookable" is defined twice.** SPEC §3 says not bookable past "the stale limit"; `DATA.md` lets Stale rows book and blocks only Old rows. Proposal: `DATA.md` wins.
- **TMDB matching can be wrong.** A wrong match puts the wrong credits answer on a film. Add a hand-kept override file and leave unmatched or ambiguous titles as "Not known yet".
- **Service worker.** Cache-first for pages would keep serving an old build. Use network-first for pages and data, with the cache as the offline fallback.
- **Vercel and bot commits. Unknown:** I recall Vercel Hobby refusing to deploy commits to a private repo when the author is not the account owner, which would hit the refresh bot. Check before settling O-4; Cloudflare Pages has no such rule that I know of.
- **`geo` is null for all 22 cinemas and 13 have no address** (verified). "Use my location" needs coordinates; it stays a Should until they are filled from each cinema's own page.
- **`docs/SPEC.md` fails the proof spec check** (verified, 11 issues): no "Risks and assumptions" or "Open questions" sections, and the nine acceptance checks have no `verify:` line.

## 4. Features worth adding

| Feature | Why | Cost | Proposed scope |
| --- | --- | --- | --- |
| Now-showing film list with filter | Closes 3.7 | Small | Must |
| Sample data on today's dates | Closes 3.1 | Small | Must |
| Neighbouring areas in the empty state | Closes 3.8 | Small | Must |
| Manual credits entries with a link | Makes Stay or Go real (3.5) | Small | Must |
| "Runs 2 h 10 min · out about 21:40" | TMDB runtime is already fetched; getting home matters in Lagos. Said as "about", and only when runtime is known | Small | Should |
| "Report a wrong time" link | A pre-filled GitHub issue or email; closes the trust loop at no cost | Small | Should |
| Share link that opens on the exact showing | The friend lands on the row, not the top of the film page | Small | Should |
| "My travel time" setting | Dims showings you cannot reach, using the user's own number. Already a Should; it is the honest half of "can I catch it" | Medium | Should |

Not proposed: push, accounts, ratings, posters, maps. Each breaks $0, the budget, or the week.

## 5. Phases, step by step

Each phase ends at a gate. Changes to the current plan are marked **new**.

**Phase 0. Unblock and set up (Day 0)**
1. Chime sends the outreach emails today; picks the host (O-4) after the bot-commit check.
2. `git init`, private repo, scaffold with the pinned versions, CI green, private deploy.
3. **New:** measure the empty app's transferred size and set the budget from it (3.2).
4. Source audit: robots and terms quoted into `data/sources.json`; one page saved per source; **new:** fixtures cut down before commit (3.6).
5. Chime reads TMDB's terms (O-6) and adds the key.
Gate: app deploys, CI green, audit filled, emails sent, budget number recorded.

**Phase 1. Design direction and core logic (Day 1)**
1. References, three directions at 390 px, Chime picks one and the name (O-1).
2. Tokens and UI brief §1–3.
3. Tests first: time helpers, showing state, countdown, freshness wording, credits wording (after 3.5 is decided), .ics.
Gate: direction and name logged; core tests green.

**Phase 2. Data (Day 2)**
1. Types and validator from `DATA.md`.
2. Parsers for the two most reachable sources, tests first.
3. `refresh --fixtures`, **new:** with dates moved to today (3.1) and **new:** one data file per area (3.3).
4. TMDB match with overrides, credits and runtime; **new:** manual credits file.
5. Coverage decision (O-5) and launch tier (3.4).
Gate: valid data files; two parsers green; tier named.

**Phase 3. Home (Day 3)**
1. Area pages as the static "Starting soon" list; `/` for all Lagos (3.3).
2. Showing row, freshness line, banners, area picker.
3. **New:** now-showing list with filter (3.7); neighbouring-area empty state (3.8).
Gate: Chime approves on the phone; a showing found in under 20 s.

**Phase 4. Film, cinema, credits (Day 4)**
Film page with Stay or Go, cinema page, started-never-bookable e2e. Should: filters, "out about" time.
Gate: acceptance checks 2, 4 and 6 pass.

**Phase 5. Reminder, share, install (Day 5)**
.ics and countdown (Must). Should: share to the exact showing, preview card, manifest, service worker (network-first).
Gate: .ics opens in iPhone Calendar and Google Calendar with the alert.

**Phase 6. Harden (Day 6)**
Budget, Lighthouse, accessibility, real phones on mobile data, `/about`, refresh workflow on only for cleared sources.
Gate: all acceptance checks pass; real numbers written down.

**Phase 7. Launch (Day 7, never cut)**
README with honest numbers and the tier reached, case study, recording, repo public.

**After the week**
- Phase 8, live and returning: every cleared source on schedule, Web Push, Coming soon.
- Phase 9, social: group plan, crowd credits confirmations, other cities (O-7).

## 6. Decisions needed from Chime

1. **Home structure (3.3):** static page per area, with `/` for all Lagos? Recommended: yes.
2. **Credits wording (3.5):** one TMDB tag reads "Stay … · TMDB", and add the manual file? Recommended: yes to both.
3. **Sample data on today's dates (3.1)?** Recommended: yes.
4. **Budget (3.2):** set from the Day 0 measurement instead of the fixed 150 / 90? Recommended: yes.
5. **Scope:** move the four "Must" rows in §4 into the plan? Recommended: yes; they are small and three of them fix breakage.
6. **Send the emails today**, and choose the host once the bot-commit question is checked.

On a yes, I will log each as a new decision (D-18 onward), update `PLAN.md`, `SPEC.md`, `DATA.md` and `features.json` to match, make `SPEC.md` pass the spec check, and start Phase 0.
