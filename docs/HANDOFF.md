# Handoff: read this first when you pick the project back up

## Latest: Day 0 done except the TMDB key, Wed 11 Nov 2026

### Where it stands
- **Plan review** (`docs/PLAN-REVIEW.md`) approved. Decisions now run D-01 to D-32. The ones that change the build most: a static page per area (D-18), credits wording and a manual credits file (D-19), sample data on today's dates (D-20), budget 160 KB JS and 200 KB total per page (D-26, D-28), launch tiers (D-23), cut-down fixtures (D-24), repo public from Day 0 (D-30).
- **Repo:** `ChimeXXD/lagos-showtimes`, public. CI green on `main` (lint, typecheck, unit, build, budget, e2e).
- **Deploy:** https://lagos-showtimes.vercel.app (Vercel, D-27). Loads; not yet checked on Chime's phone.
- **Scaffold:** placeholder home page and placeholder tokens until Day 1.
- **Outreach:** Lagocine and Filmhouse emailed on 11 Nov. No replies yet. One follow-up allowed after a week.
- **Source audit finished (D-32): nothing can be cleared on robots and terms alone.**
  - Lagocine: readable static HTML, but its compiled work. Asked.
  - Filmhouse and EbonyLife: no times in their HTML. Need a yes or a feed.
  - Genesis: needs a written yes (D-29).
  - Silverbird via Veezi: readable, but Silverbird's own terms forbid copying and linking without written permission (O-12, open).
  - So the site is **tier C (sample data)** until a reply arrives.
- **Fixture:** `tests/fixtures/silverbird/2026-11-11-ikeja.html`, cut down by `scripts/reduce-fixture.ts`. 70 showings across today and tomorrow, plus advance dates. Dates have no year and times are 12-hour.
- **TMDB terms read (D-31):** non-commercial, cache at most 6 months, logo and notice.

### Do next
1. Chime: get a free TMDB API key (themoviedb.org > Settings > API) into `.env.local` and the repo's GitHub secret `TMDB_READ_TOKEN`, before Day 2. Decide O-12. Open the deploy on the phone.
2. **Day 1** (`docs/PLAN.md`): design lane (references, three directions at 390 px, Chime picks one and the name, O-1) and core lane, tests first (`lib/time`, `lib/wording`, `lib/ics`).
3. Day 2: the first parser is Veezi, from the fixture above.

### Watch out for
- Never fetch a cinema site on a schedule until it is `cleared` (D-08). Never fetch booking links: Filmhouse and Veezi disallow them.
- The repo is public: no personal addresses, keys or full saved pages in commits. Full saved pages live in the git-ignored `tmp/audit/`.
- The proof guard refuses test runs when the Mac is near 80% memory. Closing Dia and Figma frees about 8.9 GB.
- The commit gate refuses a commit when the same command also changes files; make edits first, then commit on its own.
- This Mac runs Node 24.12; CI and `.nvmrc` say 22.
- Agmen (Tactics Board) is being built on the same Mac: one dev server at a time.
