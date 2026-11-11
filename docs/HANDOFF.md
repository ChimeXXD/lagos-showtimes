# Handoff: read this first when you pick the project back up

## Latest: plan review done, Day 0 half done, Wed 11 Nov 2026

### Where it stands
- **Plan review** (`docs/PLAN-REVIEW.md`) approved by Chime. New decisions D-18 to D-25: a static page per area, credits wording fixed plus a manual credits file, sample data on today's dates, budget from measurement, four added Must features, launch tiers, cut-down fixtures.
- **Scaffold exists** and lint, typecheck, unit tests (3) and build pass locally. Home is a placeholder; tokens are placeholders until Day 1.
- **Empty-app weight measured:** 131.9 KB JS, 136.1 KB total, gzipped. D-26 proposes 160 KB JS and 200 KB total per page; provisional until Chime confirms (O-9).
- **Git:** pushed to `ChimeXXD/lagos-showtimes`, **public from Day 0 (D-30)** because GitHub would not run Actions on the private repo without a payment method. Playwright passes locally (1 of 1). No Vercel deploy yet.
- **Outreach:** emails to Lagocine and Filmhouse sent 11 Nov. Host is Vercel (D-27); budget confirmed (D-28); Genesis and Silverbird's own site need a written yes (D-29).
- **Source audit, part one:** robots.txt for every host is in `data/sources.json`. Nothing is `cleared`.
  - Lagocine and EbonyLife allow everything. Veezi allows `/sessions/` pages.
  - Filmhouse allows public pages but disallows `/api/` and all `/select-tickets` pages.
  - Genesis and silverbirdcinemas.com carry the same `use=reference` signal as Showtimes NG (O-11).
  - `api.syticks.com` did not resolve.

### Do next
1. Chime: import the repo in Vercel; read TMDB's terms (O-6) and add the key.
2. CI is green on the public repo (run 42931829240). Private deploy (D0-4) is the last scaffold item.
3. Finish the audit: remaining terms, listing URL patterns, days ahead, cut-down fixtures (D-24).
4. Tick Day 0 in `PLAN.md` and `features.json` with evidence, then Day 1 (design direction + core lane).

### Watch out for
- Don't fetch any cinema site on a schedule until it is `cleared` (D-08). Fetch booking links never: Filmhouse and Veezi disallow them.
- The Mac is short of memory. The proof guard refuses test and e2e runs near 80%. Closing Dia and Figma frees about 8.9 GB.
- This Mac runs Node 24.12; CI and `.nvmrc` say 22.
- Agmen (Tactics Board) is being built on the same Mac: one dev server at a time.
