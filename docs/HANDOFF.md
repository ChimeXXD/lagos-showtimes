# Handoff: read this first when you pick the project back up

## Now: Day 1 is done; Day 2 (the data) is next (session of Wed 11 Nov 2026, afternoon to night)

Read this section first. The Day 0 section below is background; where the two disagree, this one is right.

### Where it stands
- **Name:** Sinima (D-36). Repo `ChimeXXD/sinima`, folder `Projects/Personal Projects/Sinima`, site https://sinima-app.vercel.app (the Vercel project is `sinima-app`; `sinima` was taken).
- **Design, all decided:** direction B · Poster (D-35); type Outfit, self-hosted at 25.5 KB (D-37); logo Ticket S (D-42); colours Ink and blue, black and white with one calm blue (D-43); Doodle illustrations (D-39). UI brief §1 to 3 are written.
- **In the app:** tokens in `src/styles/tokens.css` (Tailwind's theme; its own colours are off, D-38); the logo in the header (`src/components/Logo.tsx`); tab icon, home-screen icons and manifest (`scripts/make-icons.mjs` redraws them from `docs/design/logo/sinima-mark.svg`). The home page is still the placeholder.
- **Core logic, done with tests first** (D1-4 to D1-8): `src/lib/time` (Lagos time, showing state, countdown), `src/lib/wording` (freshness, credits, showing), `src/lib/ics` (the Remind me calendar file). Open cases are settled in D-44.
- **Checks:** 154 unit tests and 10 browser tests pass; home page 162.1 KB of 200. **CI is green on `9d285fe`.**
- **Features:** 15 of 40 passing in `docs/features.json` (Day 0 and all of Day 1). **Decisions:** D-01 to D-44. Open: O-3 (push), O-7 (other cities), O-10 (neighbouring areas).

### What happened this session, in order
1. **Reference board topped up** from 75 to 127 references (every section at 10 or more). Chime answered it: 52 liked, 13 "Not for us". Picks and the pattern summary are in `docs/design/REFERENCES.md`.
2. **Three directions built** (A · Rail, B · Poster, C · Board). Chime asked to choose by looking, not by reading the terminal, so a side-by-side pick page was added. **Chime picked B · Poster.**
3. **Name.** Chime liked Sinima, asked for other options (first a set built on Sinima, which was wrong; then nine unrelated names), and chose **Sinima**. Renamed everywhere: app, package, user agent (`SinimaBot`), docs, GitHub repo, project folder; Chime renamed Vercel.
4. **Direction B put into the app:** tokens, Outfit cut down to fit the 30 KB limit, a stricter colour check, UI brief §1 to 3.
5. **Illustrations:** three styles shown with Pinterest references; **Chime picked Doodle.**
6. **Logo, five rounds.** Six code-drawn icons ("too basic"); 20 options (Chime shortlisted Screen face); a full identity presentation; then Chime reopened logo and colour and asked for more: three mascots generated with Figma AI (owl, agama, popcorn; not picked) and three marks from design prompts; Chime's three finalists refined; **Chime chose Ticket S**, asked for it to be cut properly (the notches were painted circles; now one cut shape with real holes) and shown in six colour sets; **Chime chose Ink and blue**, the colours already in the app.
7. **Logo wired into the app** (header, icons, manifest), tests first.
8. **Core logic built**, tests first (time, wording, calendar file).
9. **CI fixed.** The browser-install step hung on GitHub's package server; it now skips the extra system packages and has a 5-minute limit. No test was removed.

### Do next (Day 2: the data)
1. `src/lib/data/types.ts` (started) and `validate.ts` from `docs/DATA.md`; the DATA.md example must validate and each rule needs a failing fixture.
2. Cut down the saved Lagocine pages in the git-ignored `tmp/audit/` to fixtures (D-24). Parsers for Lagocine and Veezi, tests first. The Silverbird fixture has no year in its dates and 12-hour times: convert through `lagosLocalToUtc`, the only local-to-UTC function.
3. `scripts/refresh.ts --fixtures`: sample data on today's and tomorrow's dates, one file per area.
4. TMDB matching and credits. Decide here where posters come from and what they cost (UI brief §1); if they can't fit the budget and TMDB's terms, posters stay on the film page only.
5. Still to draw: the doodle character and the "nothing showing" screen (Day 3).

**Needs from Chime**
- The free TMDB key (themoviedb.org > Settings > API) in `.env.local` and the GitHub secret `TMDB_READ_TOKEN`. Claude cannot enter keys.
- A yes on the neighbouring-areas list (O-10), which Claude drafts.
- Open the site on the phone, and try adding it to the home screen.

### Not verified
- Anything on a real phone: the site, the home-screen icon, the calendar file in iPhone and Google Calendar (the Day 5 check).
- The design pages in Dia itself; they were tested in headless Chromium only.
- Poster cost in data (direction B puts one on every row).
- Name clash: two web searches only, no trademark search. `sinima.com` and `sinima.app` belong to others.
- **No automated code review or fresh-context review ran this session**, although Chime's global instructions ask for one after code changes. It launches helper agents, and the cost rule below says to ask first. Chime has been told each time and has not yet said yes or no.

### How Chime likes to work (added this session; the Day 0 list below still holds)
- **Show, don't tell.** For any visual choice, build an HTML page with the options side by side and a way to pick ("Copy my pick" gives one line to paste back). Keep the terminal reply short.
- **Always open every HTML page made for Chime in Dia, without being asked:** `open -a "Dia" <file>`.
- **"Present a logo" means a full identity page**, with the logo and colours together: lockups on dark and light, mark, app icon, one colour, favicon at real sizes, named colour swatches with their uses, type, and the thing in use. `docs/design/direction-board/refine.html` and `ticket.html` are the standard. A plain grid of drafts is "basic".
- Chime thinks out loud and changes direction; a pick is a shortlist until Chime says "go with it". Read what was actually asked (the first names page missed it).
- Chime's notes are dictated, so wording can be loose; when a note is unclear, say how it was read.

### Cost and money rules
- **Never launch parallel agents or forks without asking Chime first and saying what it will cost.** Earlier, four parallel helpers used a whole five-hour usage limit in minutes.
- **No more Figma AI generations without asking.** Three mascot images were made on the GenAI-Labs team (Chime's workplace, with Chime's yes); the cost in credits is not visible to Claude. File: "Sinima logo mascots" (figma.com/design/yuQMvnOTE5B0cH3mWtzSRK).
- The reference library shows a "usage is high this month" notice; it is free during its beta. Pull 6 to 8 results per search.
- $0 is a hard limit.

### Design files, for the record (`docs/design/`)
| File | What it is |
| --- | --- |
| `REFERENCES.md` | Chime's 52 picks and the pattern summary |
| `UI-BRIEF.md` | Direction B, tokens, motion, pages, copy |
| `direction-board/index.html`, `pick.html` | The three directions; the side-by-side pick page |
| `direction-board/names.html` | Name options |
| `direction-board/art.html` | Illustration styles with Pinterest references, first icon drafts |
| `direction-board/logos.html`, `logos2.html` | 20 logo options; round two with mascots and marks |
| `direction-board/identity.html`, `refine.html` | Screen face identity; the three finalists refined |
| `direction-board/ticket.html` | Ticket S sculpted, six colour sets (`ticketPath()` in `ticket.js` generates the mark) |
| `logo/` | Final mark as SVG; Screen face in `archive/`; mascot images in `mascots/` |
| `reference-board/` | Local only, not in the repo (it names the reference library). 127 references; new ones go in the `EXTRA` array |

Skills: `logo-generator` (op7418) is installed. `ip-as-logo` (s1dashu) is not installed; Claude read its instructions from GitHub. Chime can run `npx skills add s1dashu/ip-as-logo-skill`.

### Watch out for (added this session)
- Claude's memory for this project lives under the new folder name; start sessions from `Projects/Personal Projects/Sinima`.
- The colour check (`npm run lint`) fails on any colour written outside `tokens.css`, including named colours and Tailwind's palette classes. Values the HTML needs (the browser-bar colour) are read from `tokens.css` at build time.
- Piping a long build into several `grep` commands hung a shell once; run the build on its own.

## Earlier: Day 0 (first session of Wed 11 Nov 2026)

Background. Its "Where it stands" and "Do next" lists are out of date; use the section above.

### What happened this session, in order
1. **Plan review.** Claude read every file and wrote `docs/PLAN-REVIEW.md`: what would not work as written, features to add, and the phases. Chime said yes to all of it (D-18 to D-25).
2. **Scaffold.** Next.js static export with the pinned versions, placeholder home page and tokens, lint, typecheck, unit tests, budget script, Playwright smoke test.
3. **Budget measured.** The empty app is 131.9 KB JS and 136.1 KB total, gzipped. Limits set at 160 KB JS and 200 KB total per page (D-26, D-28). Chime left the numbers to Claude.
4. **Host: Vercel** (D-27). Chime deployed it; since the rename it is https://sinima-app.vercel.app.
5. **Outreach.** Chime had Claude draft and send two emails from Chime's Gmail in the browser: Lagocine (`contact@lagocine.com`) and Filmhouse (`onlinesupport@filmhouseng.com`). No replies yet.
6. **Repo made public on Day 0** (D-30). GitHub would not run Actions on a private repo without a payment method, and the budget is $0. History was replaced with one clean commit first, because an early commit held a personal email address.
7. **Source audit finished** (D-32). Nothing can be cleared on robots and terms alone, except that Lagocine's own rules allow reading it.
8. **Chime's call: stop asking** (D-33). Lagocine becomes the live source on Day 6, with credit on every row, unless it objects first. No more emails.

### Where it stands
- **Repo:** `ChimeXXD/sinima` (renamed from `lagos-showtimes` on 11 Nov), public, `main` at the commit that holds this file. CI green (lint, typecheck, unit, build, budget, e2e).
- **Deploy:** https://sinima-app.vercel.app loads (HTTP 200, checked 11 Nov after the rename). Not yet opened on Chime's phone.
- **Decisions:** D-01 to D-33 in `docs/DECISIONS.md`. Open: O-1 (name), O-3 (push), O-7 (other cities), O-10 (neighbouring areas list).
- **Features:** 7 of 40 passing in `docs/features.json` (all of Day 0).
- **Data:** the site runs on sample data through Day 5.
  - Fixture on file: `tests/fixtures/silverbird/2026-11-11-ikeja.html` (Silverbird Ikeja's Veezi listing, cut down; 70 showings for today and tomorrow; dates have no year, times are 12-hour).
  - Full saved pages are in the git-ignored `tmp/audit/`, including a Lagocine cinema page and day page ready to cut down on Day 2.
- **Sources, in one line each:**
  - Lagocine: static HTML, rules allow everything. The live source from Day 6 (D-33).
  - Filmhouse, EbonyLife: no times in their HTML; never read directly.
  - Genesis: needs a written yes (D-29); not asked.
  - Silverbird: its Veezi page is readable, but its own terms forbid copying and linking; not read directly, sample fixture only.
- **TMDB:** terms read by Claude (D-31): non-commercial, cache at most 6 months, logo and notice. **The API key is still missing.**

### The plan for Days 1 to 5 (as agreed with Chime)

| Day | Focus | What gets built | What Chime does | Gate |
| --- | --- | --- | --- | --- |
| 1 | The look, and the logic underneath | Three visual directions on one phone page; tokens from the pick; time, showing-state, wording and calendar-file logic, tests first | Picks a direction and the name (O-1) | Direction and name chosen; logic tests green |
| 2 | The data | Data format and validator; readers for Lagocine and the Veezi fixture; sample data moved onto today's dates; one data file per area; TMDB matching | Gives the TMDB key; confirms the neighbouring-areas list (O-10) | Valid data files; both readers green |
| 3 | The home screen | Area pages and all-Lagos page; showing row; area picker; "Now showing" list with filter; empty state; banners | Approves on the phone | A showing found in under 20 seconds |
| 4 | Film, cinema and credits | Film page with the Stay or Go chip; cinema page; started-showing test | Nothing required | Every showing listed; a started showing can't be booked |
| 5 | Reminder, share, install | "Remind me" calendar file; live countdown; WhatsApp share to the exact showing | Checks the reminder on iPhone and Android | Reminder opens in both calendars with the alert |

Extras if a day has room. Day 4: filters, "out about 21:40", "report a wrong time". Day 5: preview card, add-to-home-screen, offline mode. Day 6 hardens and switches on Lagocine; Day 7 is the launch. Details: `docs/PLAN.md`.

### Do next
1. **Day 1, design lane:** references by surface (`docs/design/REFERENCES.md`), three directions at 390 px in `docs/design/direction-board/index.html`, then stop for Chime's pick and the name.
2. **Day 1, core lane, tests first:** `src/lib/time` (`lagos.ts`, `showingState.ts`, `countdown.ts`), `src/lib/wording` (`freshness.ts`, `credits.ts`, `showing.ts`), `src/lib/ics/ics.ts`, exactly as the tables in `docs/DATA.md` (credits wording as revised by D-19; hours band to under 6 h, D-25).
3. Chime: get the free TMDB key (themoviedb.org > Settings > API) into `.env.local` and the GitHub secret `TMDB_READ_TOKEN` before Day 2; open the deploy on the phone.
4. Left over from the code review for Day 1: stop Tailwind's built-in colour classes and named colours slipping past `check-tokens`, and fix the self-referencing tokens in `globals.css`, both when the real palette lands.

### How Chime likes to work (learned this session)
- Anything sent under Chime's name says "I'm Chimezie" and is signed "Chimezie Ekpendu", never "Chime".
- Plain words. Chime asked what "budget" meant: explain a term the first time it appears.
- Plans and comparisons as tables.
- Fewer questions: make the low-risk calls and say what was chosen. Chime said "I'm tired of asking."
- $0 is a hard limit: no paid plans, anywhere.

### Watch out for
- Never fetch a cinema site on a schedule until it is `cleared` (D-08). Never fetch booking links: Filmhouse and Veezi disallow them.
- The repo is public: no personal addresses, keys or full saved pages in commits.
- The proof guard refuses test runs when the Mac is near 80% memory. Closing Dia and Figma frees about 8.9 GB.
- The commit gate refuses a commit when the same command also changes files: edit first, then commit on its own. Changing `.claude/proof.json` needs Chime's OK.
- Rewriting git history is blocked by the permission system unless Chime allows it.
- This Mac runs Node 24.12; CI and `.nvmrc` say 22.
- Agmen (Tactics Board) is being built on the same Mac: one dev server at a time.
