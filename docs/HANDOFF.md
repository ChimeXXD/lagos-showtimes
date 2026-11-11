# Handoff: read this first when you pick the project back up

## Latest: Day 0 done, Day 1 starts next (session of Wed 11 Nov 2026)

Chime plans to start Day 1 on Thu 12 Nov. Start there; nothing else is waiting.

### What happened this session, in order
1. **Plan review.** Claude read every file and wrote `docs/PLAN-REVIEW.md`: what would not work as written, features to add, and the phases. Chime said yes to all of it (D-18 to D-25).
2. **Scaffold.** Next.js static export with the pinned versions, placeholder home page and tokens, lint, typecheck, unit tests, budget script, Playwright smoke test.
3. **Budget measured.** The empty app is 131.9 KB JS and 136.1 KB total, gzipped. Limits set at 160 KB JS and 200 KB total per page (D-26, D-28). Chime left the numbers to Claude.
4. **Host: Vercel** (D-27). Chime deployed it: https://lagos-showtimes.vercel.app.
5. **Outreach.** Chime had Claude draft and send two emails from Chime's Gmail in the browser: Lagocine (`contact@lagocine.com`) and Filmhouse (`onlinesupport@filmhouseng.com`). No replies yet.
6. **Repo made public on Day 0** (D-30). GitHub would not run Actions on a private repo without a payment method, and the budget is $0. History was replaced with one clean commit first, because an early commit held a personal email address.
7. **Source audit finished** (D-32). Nothing can be cleared on robots and terms alone, except that Lagocine's own rules allow reading it.
8. **Chime's call: stop asking** (D-33). Lagocine becomes the live source on Day 6, with credit on every row, unless it objects first. No more emails.

### Where it stands
- **Repo:** `ChimeXXD/lagos-showtimes`, public, `main` at the commit that holds this file. CI green (lint, typecheck, unit, build, budget, e2e).
- **Deploy:** https://lagos-showtimes.vercel.app loads (HTTP 200). Not yet opened on Chime's phone.
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
