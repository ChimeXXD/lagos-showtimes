# Progress

Build log for the one-week plan (`docs/PLAN.md`). Newest entry first. Each entry: **Changed**, **Checked** (with real numbers), **Not verified**, **Next**.

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
