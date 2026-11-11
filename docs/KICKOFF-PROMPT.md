# Kickoff prompts for Claude CLI

Open Terminal in this folder (`Projects/Personal Projects/Lagos Showtimes`) and run `claude`. Paste one prompt per session.

## Session 1: Day 0 (setup, audit, ask)

```
Read CLAUDE.md, docs/HANDOFF.md, docs/PLAN.md, docs/DECISIONS.md and docs/DATA.md. We're starting Day 0 of
Lagos Showtimes. Ask me first which host to use (O-4: Vercel Hobby or Cloudflare Pages).
1. git init, private GitHub repo ChimeXXD/lagos-showtimes, first commit of these docs.
2. Scaffold Next.js in place with exact versions: next 16.4.3, react 19.3.1, react-dom 19.3.1, typescript 5.9.3,
   tailwindcss 4.3.3 + @tailwindcss/postcss 4.3.3, eslint 9 + eslint-config-next 16.4.3, @playwright/test 1.64.1,
   plus vitest and cheerio as dev dependencies (D-03). App Router, src/, static export. Add the npm scripts from
   CLAUDE.md. One Vitest test and one Playwright test pass. CI green on push to main.
3. Deploy privately to the host I picked.
4. Data-source audit: for each source in data/sources.json, read robots.txt and the terms page, quote the
   relevant lines into the file, note the listing URL pattern and days ahead. Save one listing page per source to
   tests/fixtures/<source>/<yyyy-mm-dd>.html with a single manual request each. Change no status to "cleared"
   without asking me.
5. Remind me to send the emails in docs/OUTREACH.md and to read TMDB's API terms. Don't send anything yourself.
Commit and push after each green step, tick Day 0 in docs/PLAN.md and docs/features.json, log the session in
PROGRESS.md and rewrite docs/HANDOFF.md. Ask me before anything that costs money or adds a dependency.
```

## Session 2: Day 1 (design direction + core lane)

```
Read CLAUDE.md, docs/HANDOFF.md, docs/design/UI-BRIEF.md and docs/DATA.md. Today is Day 1 (D-13, D-14).
Design lane:
1. Collect 30-50 references by surface (docs/design/REFERENCES.md lists surfaces and searches). Use the reference
   library connector if it's connected (never name it in the repo); keep images in docs/design/reference-board/images/
   (git-ignored). Note each pick and what to take from it.
2. Write the pattern summary.
3. Build docs/design/direction-board/index.html with three distinct directions at 390 px wide. Each shows:
   Starting soon in Lekki at 18:00 with fresh, stale and started rows; a film page with a Stay or Go chip and
   "Not known yet"; the sample-data banner; and the name options from O-1 as a wordmark.
Core lane, while I look (tests first, fixed clock, UTC instants):
4. src/lib/time (lagos.ts, showingState.ts, countdown.ts), src/lib/wording (freshness.ts, credits.ts,
   showing.ts) exactly as the tables in docs/DATA.md, and src/lib/ics/ics.ts. Cover every band boundary.
5. Stop and ask me to pick a direction and a name. Then fill UI-BRIEF §1-3, write src/styles/tokens.css, and log
   both picks as new decisions.
```

## Session 3+: build days

```
Read CLAUDE.md, docs/HANDOFF.md, the latest PROGRESS.md entry and docs/PLAN.md. Continue with Day <N>.
Tests first for lib/time, lib/wording, lib/data, lib/ics and every parser. Pass the day's gate before moving on,
check UI on my phone, commit and push after each green step, and update PLAN.md, features.json, PROGRESS.md
and HANDOFF.md. If a permission reply came in, I'll paste it; log it in DECISIONS and data/sources.json.
```
