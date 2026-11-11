# Progress

Build log for the one-week plan (`docs/PLAN.md`). Newest entry first. Each entry: **Changed**, **Checked** (with real numbers), **Not verified**, **Next**.

## Day 1: logo and colours settled; logo in the app (Wed 11 Nov 2026, late night)

**Changed**
- Chime chose the logo, Ticket S (D-42), and the colours, Ink and blue (D-43), after four rounds of options on HTML pages (`logos.html`, `logos2.html`, `refine.html`, `ticket.html`). Three mascot images were generated with Figma AI on the GenAI-Labs team and not used.
- Illustration style: Doodle (D-39).
- In the app: `src/components/Logo.tsx` in the header; `public/icons/` (SVG tab icon, 192 and 512 PNG, maskable 512, Apple touch icon 180) drawn by `scripts/make-icons.mjs`; `public/manifest.webmanifest`; browser-bar colour read from `tokens.css` at build time.

**Red first**
- `tests/e2e/brand.spec.ts` › "the header shows the Ticket S mark beside the name" failed with "element(s) not found" before the logo was added.

**Checked**
- e2e: 10 pass (3 new: mark in the header as one cut shape; tab, Apple and manifest icons all return 200 as images; PNGs are 192, 512, 512 and 180 px). Theme tests now also check the browser-bar colour.
- Unit: 29 pass. Lint (after it caught two colours typed into `layout.tsx`, now read from the tokens file) and typecheck clean.
- Build and budget: home page 162.1 KB of 200 (JS 131.9 of 160).
- Looked at the built home page at 390 px in light and dark, and at every icon.

**Not verified**
- Adding the site to a real phone's home screen. How the maskable icon is cropped by Android launchers.
- No fresh-context or automated code review was run (cost rule: no helper agents without asking).
- CI on GitHub for this commit; earlier runs today were cancelled by later pushes or failed on GitHub's network.

**Next**
- Core lane, tests first: `src/lib/time`, `src/lib/wording`, `src/lib/ics` (D1-4 to D1-8). The doodle character and the empty state.

## Day 1: direction B written up; tokens and font in the app (Wed 11 Nov 2026, night)

**Changed**
- `docs/design/UI-BRIEF.md` §1 to 3 written for direction B · Poster.
- `src/styles/tokens.css`: the real palette (G with the blue Book button), type sizes, radii and motion, as Tailwind's theme. Tailwind's own colour palette is off (D-38).
- Outfit self-hosted at `public/fonts/outfit-sinima.woff2`, 25.5 KB, weights 400 to 600, with its licence (D-37). Counted in the page budget.
- `scripts/check-tokens.mjs` now also fails on Tailwind palette classes and named colours.

**Red first**
- `tests/unit/tokens.test.ts` › "defines every colour role in light and dark" failed against the placeholder tokens (6 roles missing) before the new tokens were written.

**Checked**
- Unit: 29 pass (26 new: roles, contrast AA and AAA from the token values, the colour check's hits and misses).
- e2e against the built site: 7 pass (light and dark palette as rendered, font served from our site at 25.5 KB, no sideways scroll at 390, 360 and 320).
- Build and budget: home page 161.2 KB of 200 (JS 131.9 of 160), now counting the font.
- Built CSS: `light-dark()` is compiled with a fallback for older Safari; no Tailwind palette classes are emitted.
- Lint and typecheck clean.

**Not verified**
- On a real phone. The home page is still the placeholder, so only the font, colours and heading show.
- No fresh-context or automated code review was run (cost rule: no helper agents without asking).
- CI on GitHub for this commit.

**Next**
- Illustration and icon references (O-13). Core lane, tests first: `src/lib/time`, `src/lib/wording`, `src/lib/ics`.

## Day 1: direction B and the name Sinima; renamed everywhere but Vercel (Wed 11 Nov 2026, night)

**Changed**
- Chime picked direction B · Poster (D-35) on a new side-by-side pick page, and the name Sinima (D-36) from a names page.
- Renamed to Sinima: app title and heading, package name, fetcher user agent, README, CLAUDE.md, docs and design pages; GitHub repo to `ChimeXXD/sinima`; project folder to `Sinima`.

**Checked**
- After the rename: lint and typecheck clean, 3 unit tests pass, build 136.1 KB total (limit 200), e2e smoke test passes with the heading "Sinima", spec check PASS (40 features, 8 passing).
- `gh repo view ChimeXXD/sinima` returns the repo; local `main` tracks it.
- Outfit variable font, Latin subset: 32,228 bytes, over the 30 KB limit.

**Not verified**
- Vercel: not renamed (no login available to Claude). Whether the deploy still builds after the repo rename was not checked.
- Name clash: two web searches only; no trademark search.

**Next**
- Chime renames the Vercel project. Then UI brief §1 to 3, tokens, illustration references (O-13).

## Day 1, design lane: references answered, three directions built (Wed 11 Nov 2026, late)

**Changed**
- Reference board topped up from 75 to 127 references (every section at 10 or more). Chime answered it: 52 liked, 13 "Not for us", palette G with a blue Book button (D-34).
- `docs/design/REFERENCES.md`: picks table and pattern summary filled from Chime's answers.
- `docs/design/direction-board/`: three directions (A · Rail, B · Poster, C · Board), each with Starting soon, the stale state and a film page with Stay or Go, at 390 px, with light/dark and name switches.
- O-13 opened: illustrations and the app icon (Chime wants custom ones, references from Pinterest first).

**Checked**
- Headless Chromium, 9 frames in light and dark (18 renders): every frame 390 px wide, no sideways overflow, no clipped element, every link and button at least 44 x 44, all text at least 4.5:1 and start times at least 7:1, both fonts loaded, no console errors.
- proof design check on the board: 9 screens, 1 issue left (no `interactions.json`; that belongs to the locked mockup after the pick).
- ESLint clean on `board.js`. Reference board re-run after the palette edit: 127 images load, no errors.

**Not verified**
- The boards in Dia or on a phone (headless Chromium only).
- Font file sizes for Figtree and Outfit against the 30 KB limit, and the data cost of posters (direction B). The board loads the fonts from Google; the site would self-host a subset.
- No fresh-context review was run (cost rule: no helper agents without asking).

**Next**
- Chime picks a direction and the name (O-1). Then UI brief §1 to 3, tokens, and the illustration references (O-13).
- Core lane, tests first: `src/lib/time`, `src/lib/wording`, `src/lib/ics`.

## Day 0, part two: deploy and source audit (Wed 11 Nov 2026)

**Changed**
- Chime deployed to Vercel: https://lagos-showtimes.vercel.app.
- Finished the source audit: terms, listing URL patterns and days ahead in `data/sources.json`; findings in `docs/RESEARCH.md`; conclusions as D-31 (TMDB terms) and D-32 (no source clearable without a yes), with O-12 open (Silverbird via Veezi).
- `scripts/reduce-fixture.ts` cuts a saved page down to listing markup (D-24). First fixture: `tests/fixtures/silverbird/2026-11-11-ikeja.html`.
- Silverbird Ikeja's address and Veezi page added to `data/cinemas.json`.

**Checked**
- `curl https://lagos-showtimes.vercel.app/` returned 200; Vercel's commit status on `main` is success.
- Fixture: 38.8 KB, 70 `<time>` entries, 0 images, scripts or poster links; 9 date headings (11 and 12 Nov, then 4 to 10 Dec).
- Filmhouse film and showtimes pages: 0 times and 0 booking links in the HTML. EbonyLife home: embedded page data is empty.
- Spec check PASS (40 features, 7 passing). Lint and typecheck clean.

**Not verified**
- The deploy on Chime's phone.
- Whether Filmhouse's times come from `/api/` specifically (inferred: they are not in the HTML, and `/api/` is the disallowed data path).
- Lagocine's exact days ahead beyond the one cinema page read.

**Next**
- Chime: TMDB API key before Day 2; decide O-12.
- Day 1: design direction and core lane.

## Plan review and Day 0, part one (Wed 11 Nov 2026)

**Changed**
- Plan review written (`docs/PLAN-REVIEW.md`); Chime said yes to all. Logged as D-18 to D-25; `PLAN.md`, `SPEC.md`, `DATA.md`, `UI-BRIEF.md`, `CLAUDE.md` and `features.json` (now 40 items) brought into line.
- Scaffold: Next.js 16.4.3 static export, React 19.3.1, TypeScript 5.9.3, Tailwind 4.3.3, ESLint 9, Vitest 5.1.0, Playwright 1.64.1, cheerio 1.2.0. Placeholder home page and placeholder tokens. Scripts: `check-tokens.mjs`, `check-budget.mjs`, `serve-out.mjs`, `refresh.ts` (a stub that exits non-zero).
- `git init` on `main`. `.claude/proof.json` added (the checks the proof gate runs).
- Source audit, part one: robots.txt read once per host and recorded in `data/sources.json`; Genesis's terms page read. Home or listing pages saved to `tmp/audit/` (git-ignored).

**Checked**
- `npm run lint`: clean. `npm run typecheck`: clean. `npm test`: 3 of 3 passed. `npm run build`: wrote `out/`.
- `npm run budget` on the empty app: 131.9 KB JS, 2.4 KB CSS, 1.9 KB HTML, 136.1 KB total (gzip 9, `nomodule` polyfill excluded). D-12's 90 KB JS limit could not have held. D-26 proposes 160 KB JS and 200 KB total.
- Spec check: PASS, 13 acceptance criteria all with `verify:`, 40 features, 0 passing.
- All pinned versions exist on npm.

**Not verified**
- Playwright e2e: 1 of 1 passed locally once Chime closed Dia and Figma (the memory guard had refused it twice before).
- First commit `ce88d83` pushed to the private repo `ChimeXXD/lagos-showtimes`. **CI did not run:** GitHub refused to start the job (run 42930934222: "recent account payments have failed or your spending limit needs to be increased"). No deploy yet: the Vercel CLI is not installed and deploying needs Chime's login.
- Audit still open: terms for Filmhouse (privacy policy unread), EbonyLife, Silverbird; listing URL patterns and days ahead; cut-down fixtures (D-24); Silverbird Ikeja's Veezi token.
- Whether Filmhouse and EbonyLife times sit behind an API (inferred from script-drawn pages with no times in the HTML).

- CI on the public repo: run 42931829240 green on `9119eaf` (lint, typecheck, 3 unit tests, build, budget, 1 e2e). History was replaced with one clean commit before going public.

**Next**
- Chime: OK `.claude/proof.json`; read TMDB's terms (O-6). Done since: host is Vercel (D-27), budget confirmed (D-28), Genesis and Silverbird need a written yes (D-29), and the Lagocine and Filmhouse emails were sent on 11 Nov.
- Repo made public on Day 0 (D-30) so Actions can run at $0. Chime: import the repo in Vercel.
- Then: CI green (first Playwright run), private deploy, finish the audit.

## Project set up (Fri 6 Nov 2026)

**Changed**
- Wrote the PRD (research, competitors, brainstorm, phases, data access and legal), CLAUDE.md, DECISIONS (D-01 to D-17, O-1 to O-7), PLAN, SPEC, DATA (schema v1, freshness, showing and credits wording), RESEARCH, HANDOFF, KICKOFF-PROMPT, features.json (36 items), UI-BRIEF draft, REFERENCES template, OUTREACH drafts.
- `data/cinemas.json` (22 cinemas, 12 areas), `data/sources.json` (7 sources, none cleared), `docs/examples/showtimes-v1.example.json`.
- Repo config: README, MIT LICENSE, .gitignore, .claude/settings.json, CI workflow, disabled refresh workflow template, .env.example.

**Checked**
- Every JSON file parses with `python3 -c json.load`.
- Lagocine's robots.txt allows all; Showtimes NG's says `use=reference, ai-train=no` (6 Nov).

**Not verified**
- Filmhouse robots.txt and every chain's terms; TMDB's full API terms; name clashes beyond a web search; cinema coordinates.

**Next**
- Day 0: host pick, repo, scaffold, CI, private deploy, data-source audit, Chime sends outreach emails.
