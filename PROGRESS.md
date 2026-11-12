# Progress

Build log for the one-week plan (`docs/PLAN.md`). Newest entry first. Each entry: **Changed**, **Checked** (with real numbers), **Not verified**, **Next**.

## A light and dark switch (Thu 12 Nov 2026, night)

**Changed** (D-58)
- `ThemeToggle.tsx`: a round button beside search on every screen (moon in light, sun in dark). It follows the phone until tapped, then keeps the choice (`ls.theme`). A script in the page head applies the kept choice before the first paint. The browser bar colour follows.
- Tokens: `:root[data-theme]` fixes `color-scheme`. `--color-tile-edge` replaces the one `prefers-color-scheme` media query, so the dark logo tiles follow the switch too.
- Header grid: four columns on a computer, three on a phone (logo, search, switch).
- The phone pickers size to their words, and the area pin hides under 350 px. Labels were cut short at 360 and 320 px ("All L…"), which the earlier test did not check.

**Checked**
- `theme.spec`: 9 pass, 3 of them new. The new tests were written before the code, but the memory guard stopped the first run. So the red run is shown by `theme.toggle` being absent from HEAD, not by a failing run.
- `cinemas-rows.spec`: 8 pass. The new label check failed first at 360 and 320 px.
- Screenshots of the header at 390, 360, 320 and 1440 px, light and dark.

**Not verified**
- On a real phone.

## The Cinemas tab as logo rows (Thu 12 Nov 2026, night)

**Changed** (D-56)
- Two mockup rounds (`mockup/cinemas.html`) after Chime's round 3 Instacart picks:
  - Round 1: logo rows.
  - Round 2: three phone filter options. Logos trimmed so they centre, Magnificent's real logo, the freshness line moved away from the filters.
  - Chime picked Option 1 and said: build it, show the real logos with a way to have one removed, Cinemas page only, merge Leisure Mall.
- Built:
  - `CinemaRow.tsx`: logo tile, name, "Next at 14:00 · 4 films · Lekki", tags, a stretched link and a heart.
  - `Pickers.tsx`: on a phone, three pickers in one row, each opening a sheet.
  - `CinemasBoard.tsx`: groups (Your cinemas, the area, next door, then six from the rest of Lagos with "Show all"). The freshness line sits once, under the first heading.
  - `src/styles/cinemas.css`, and the tile colour tokens.
  - `CinemaCard` is gone; the times now live on each cinema's page.
- Logos: 12 chains in `public/logos/` (41 KB together), each trimmed, resized and cut to 256 colours. `data/logos.json` names the source of each. The footer says the logos belong to their owners and links to GitHub issues for removal.
- `rowWarning()` in `freshness.ts` puts "Times from yesterday" or "Times may have changed" on a row with old times.
- `data/cinemas.json`: Leisure Mall merged into Filmhouse Surulere (21 cinemas).
- Tests changed for the new requirement:
  - `cinemas.spec`: the row states its next time in words; a time is tapped on the cinema's page; areas and formats are picked through the sheets.
  - `nav.spec`: the chip test moved to a film's page, which still has chips.
  - `playwright.config.ts` and CI (`.github/workflows/ci.yml`): the test build makes its sample data as of 08:00 Lagos. Without that, a build after about 20:00 holds only the evening's last showings and two HTML tests fail. Those tests were not changed.

**Checked**
- `cinemas-rows.spec` (8 tests), plus `cinemas.spec` and `nav.spec`: 34 pass.
- Unit tests: `logos.test.ts` 14 tests, the registry merge test, `rowWarning` 3 tests.
- Not run red first: the browser tests in `cinemas-rows.spec` were written before the components but not run before them. The unit tests were run red first.
- Screenshots of `/cinemas` and `/area/lekki` at 390 and 360 px and 1440 px, light and dark, with the area and format sheets open, compared with the mockup.

**Not verified**
- On a real phone: the sheets, and the keyboard rising for search.
- The Films page and film pages keep their chips (Chime: Cinemas page only for now).

## Chime's review, first fixes: Films first, search, phone chips (Thu 12 Nov 2026, evening)

**Changed** (D-55)
- Chime reviewed the live site by screen recording. The first three fixes are in:
  - The tabs now read Films · Cinemas · Starting soon. `/` is Films; Cinemas moved to `/cinemas`; `/films` is gone. A saved area now sends the Cinemas tab to that area (`src/components/Tabs.tsx`), not the home page.
  - Search (`src/components/Search.tsx`): on a phone the search button opens a box on the page you're on, and matching films show as you type. Before, it only jumped to the Films tab.
  - On a phone the area chips wrap onto a second line. Before, they scrolled under "More areas" and were cut in half. Tab names also stay on one line down to 320 px.
- Docs: `SPEC.md` routes, flows and acceptance check 14; `features.json` D3-6. `scripts/check-budget.mjs` now measures `cinemas.html` instead of the removed `films.html`; the limits are unchanged.
- Existing tests were moved to the new addresses: `films.spec` uses `/` for `/films`, and `cinemas.spec` uses `/cinemas` for `/`. The requirement changed (D-55); the tests weren't weakened.
- Mobbin references for the Cinemas page redesign are on `docs/design/reference-board/round3-cinemas.html` (local only: 24 references). The logo source for each brand is listed in the session notes.

**Checked**
- `tests/e2e/nav.spec.ts`: 9 tests, written first and red on the old code:
  - The tab and search tests failed: no Films home, and no `search.open`.
  - At 390 px the chip test listed `area.chip.ikeja` and `area.chip.all` as cut off.
  - At 360 and 320 px the one-line test listed "Starting soon" as wrapped.
- All 9 pass now. The full gate results are in the commit.
- Budget: the heaviest page is 187.8 KB of 200.
- Screenshots at 390 and 360 px and at 1440 px desktop, compared with the live site.

**Not verified**
- Not tried on a real iPhone: does the keyboard rise when the search button is tapped? The code focuses the box inside the tap, which iOS needs.
- The Cinemas page redesign (logos, connected cards) is not started; it waits for Chime's reference picks and a mockup.

**Next**
- Chime picks references on round 3. Then a Cinemas page mockup with logos, which needs a call on using chain logos. After approval, build it.

## The redesign, built (Thu 12 Nov 2026)

**Changed**
- Chime rejected the Day 3 home screen as a design (D-49). Since then: a structure document (sitemap and journeys, PDF), a second reference board, and four mockup drafts (Danfo; cofounder.co style; back to the first with motion; Lagoon colours). Chime approved draft 4.
- The app now is that mockup: `/`, `/area/[slug]`, `/cinema/[id]`, `/films`, `/film/[slug]`, `/soon`, the showing panel and the share dialog. Lagoon tokens, Geist and Anton, the mockup's styles and motion in `src/styles/sinima.css`.
- Data: TMDB poster paths through `tmdb.ts`, `credits.json`, the pipeline and `Film.posterPath`; "Ramayana" matched by hand. `src/lib/data/format.ts`, `programme.ts`, richer list data; `src/lib/wording/film.ts`; `src/lib/browser.ts`, `src/lib/saved.ts`.
- `SPEC.md` §5 and §8, `features.json` and the palette tests rewritten for the new design (D-54). The Day 3 components and their browser tests are deleted.

**Red first**
- Unit: `credits.test` "gives every film an entry" (posterPath missing); `programme.test` "Cannot find package '@/lib/data/format'"; `select.test` "keeps what a screen shows" (no `at`); `programme.test` "anchorFor is not a function".
- **Browser tests were written before the screens but first run once the screens existed.** Three failed on that first run: one for a real fault (a build between midnight and 04:00 showed nothing under Today; fixed, D-54 c), two for faults in the tests (a heading locator; a 44 px check that needed half a pixel of rounding).

**Checked**
- Unit 366 pass. Browser 44 pass (run twice). Lint, typecheck, build clean.
- `/code-review --fix` at high effort: 10 findings, 9 fixed by it. The serious ones: closing Share emptied the showing panel but left it blocking the page; "More areas" was cut off on phones and its lower options sat under the cards; the film page scrolled sideways at 390 px; a shared link with a broken `%` crashed the page. The tenth (rule 3: "today", "tomorrow" and "still to start" were written into the page's own HTML from the build time) was fixed afterwards: before the browser has the time, days are named by date, nothing is called soon, and the whole day is listed. A test now checks every kind of page for clock-dependent words.
- Budget: the gate caught home at 200.9 KB, over the 200 limit, once the after-midnight fix put today's cards into the page's own HTML. The two fonts were then cut down to the letters and weights the site uses (35.3 KB to 21.6 KB). Now: home 188.0 KB, Films 184.2, Starting soon 185.5, heaviest area 188.0, cinema 180.7, film 181.5.
- Screens captured from the built site at 1440 and 390 px, light and dark, and compared by eye with the mockup: home, a cinema, a film with IMAX chosen, Films, Starting soon, the panel on desktop and phone, share.
- Text contrast on the mockup, both modes: nothing under 4.5:1 (3:1 large).

**Not verified**
- On a real phone. Posters loading over mobile data. A screen reader on the panel and the share dialog.
- No fresh-context verifier ran on this build (the review ran instead; the Mac was at its memory ceiling).
- Review notes left open: "Remind me" is still offered after a showing has started; font sizes are written in `sinima.css`, not as tokens; `validate.ts` does not check `posterPath`; unused helpers remain (`filmCounts`, `soonCount`, `nextDayName`, `loadArea`, `showingLine`, `showingSentence`).
- The motion by eye: tests confirm it runs in the mockup; in the app it was not watched.
- Kids and Nollywood filters, "Save image", the WhatsApp preview image, the About page, offline: not built.
- Anton now holds capitals, digits and punctuation only; a film title with a letter outside those would fall back to Geist on its title poster.

**Next**
- Chime looks at the live site. Then: About page, the remaining Should items, a daily rebuild.

## Day 3: the home screen (Wed 11 Nov 2026, night)

**Changed**
- Routes: `/` (all of Lagos), `/area/[slug]` (12 areas), `/film/[slug]` (a plain list for now).
- `src/lib/data/select.ts` (list data, sections, banner, film counts, section names) and `load.ts`; `src/lib/time/useNow.ts`.
- Components: `Page`, `ShowingsBoard`, `ShowingRow`, `AreaPicker`, `FilmList`.
- `npm run build` now runs `refresh --fixtures` first. The budget script measures `/`, the largest area page and the largest film page.
- `docs/design/direction-board/posters.html`: three poster options for Chime to pick from. D-48.

**Red first**
- `select.test.ts` failed with "Cannot find package '@/lib/data/select'"; later additions failed with "laterName is not a function", "nextDayName is not a function" and, for film counts with the time, a wrong count.
- **The browser tests were written before the screens but first run after them, so they were not seen failing.** One failed for its own reason (it looked for `datetime`, React writes `dateTime`). A verifier then judged each: most would fail if their requirement broke; the weak ones it named were fixed or removed, and three tests were added (section order with Tomorrow, the real Book path, films that have finished).
- The smoke test's heading check changed from "Sinima" (the placeholder) to the wordmark plus "Starting soon in Lagos".

**Checked**
- Unit 324 pass. Browser 32 pass. Lint, typecheck and build clean.
- Budget with tonight's build: `/` 188.3 KB, Lekki 177.0, the largest film page 175.2, of 200. With a full two-day programme `/` measured 195.7.
- Screenshots at 390 and 360 px, light and dark, compared by eye with the direction B frame: header, title, banner, rows, picker sheet, empty state, film list.
- `/code-review --fix`: 10 findings, 7 fixed (a showing could stay bookable up to 30 s after its start; the "Check on" link could open the wrong site; the sample banner could vanish on an area with no rows). Fresh-context verifier: 11 of 12 requirements passed; its one gap (a "Today and tomorrow" heading baked into the page) and its note on film counts are fixed.

**Not verified**
- On a real phone (the Day 3 gate, D3-3). VoiceOver or TalkBack reading a row.
- The deployed site: Vercel must run the new prebuild step; not checked yet.
- Soft navigation to `/` does not redirect to the saved area (D-48 d).
- Type sizes written in components (`text-[14px]`, `text-[19px]`, `text-[10px]`) are not tokens yet.
- The site empties two days after a build; nothing rebuilds daily.

**Next**
- Chime: pick a poster option; look at the site on the phone.
- Day 4: film page (areas, Stay or Go tile), cinema page, started rows.

## Day 2: TMDB run for real; neighbours confirmed (Wed 11 Nov 2026, night)

**Changed**
- Chime added a TMDB key. `scripts/tmdb.ts` now also takes TMDB's short API key (sent in the address, never printed). `data/credits.json` written and committed: 14 films.
- Neighbouring areas confirmed by Chime and added to `data/cinemas.json`; automated reviews allowed (D-46). D-47: the TMDB results and poster sizes.

**Red first**
- The first real run failed with "TMDB answered 401": the key in `.env.local` is the short API key, and the script only sent the long token's header.
- `refresh.test.ts` › "gives each showing its id, its film ..." failed once `data/credits.json` existed (it expected `tmdbId: null`). The test read a file that now changes weekly, so that line now checks only the film's id and origin.

**Checked**
- `node scripts/tmdb.ts` against the live API: 14 of 31 matched. Each checked by eye with a second script that printed TMDB's title, release date and country: all 14 right. 2 of 31 have a credits answer (Spider-Man: Brand New Day, after; Street Fighter, during).
- After `refresh`, those films carry the TMDB id, runtime and answer in `data/showtimes.json`.
- The key's value appears in no file under `out/`, `data/`, `public/`, `scripts/`, `src/`, `tests/` or `docs/`.
- Poster sizes from TMDB's image host for the 14 matches: 5.6 KB average at 92 px, 12.9 KB at 154 px, 17.5 KB at 185 px.
- Unit: 301 pass. Lint, typecheck and build clean.

**Not verified**
- Three films a person could match by hand: "Ikenga" (TMDB has "Ikenga: The Last Festival", Aug 2026), "Ramayana" (probably the same film as "Ramayana: Rise of a Legend", listed twice by different cinemas) and "Verity" (two 2026 films share the title). Left unmatched.
- The GitHub secret is not set; nothing in CI needs it yet.

**Next**
- Day 3: the home screen; posters shown to Chime side by side.

## Day 2: the data (Wed 11 Nov 2026, evening)

**Changed**
- `src/lib/data/types.ts` (all of schema v1) and `validate.ts` (every rule in DATA.md §Rules).
- Two Lagocine fixtures cut down from the saved pages (`tests/fixtures/lagocine/`), listed with the Veezi one in `tests/fixtures/index.json`. `reduce-fixture` can now keep a page's build stamp.
- Parsers: `scripts/sources/lagocine.ts` (day page, cinema page) and `veezi.ts`.
- `scripts/pipeline.ts` and `refresh.ts`: `npm run refresh -- --fixtures` writes `data/showtimes.json`, `public/data/all.json` and 12 area files on today's and tomorrow's dates. The files are git-ignored (D-45).
- Credits: `scripts/credits.ts` (match rule, keywords, manual entries, share), `scripts/tmdb.ts`, `data/tmdb-overrides.json`, `data/credits-manual.json` (both empty).
- D-45 (the open cases), the O-10 draft, DATA.md notes on how the validator reads the table and on sample data.

**Red first**
- `validate.test.ts`, the two parser tests, `refresh.test.ts`, `credits.test.ts`: each failed with "Cannot find module" / "Cannot find package" before its module existed.
- `refresh.test.ts` › "puts the TMDB id, runtime and credits answer on a film" failed with "expected { id: 'whalefall', … } to match object { tmdbId: 11 … }" before refresh merged credits.
- Corrections to new tests, not to behaviour: the order of two error messages; Ramayana's rating (the page says "NR"); showing counts, after the parser showed Lagocine repeats 59 rows (checked with a separate script: all Genesis, same booking link); a missing fake answer in the TMDB test.

**Checked**
- Unit: 299 pass (145 new). `lib/data` 58, `scripts/sources` 20, `scripts/refresh` 39, `scripts/credits` and `scripts/tmdb` 28. Lint and typecheck clean.
- Parser counts match counts taken from the saved pages with a separate Python script (353 rows, 31 films, 20 cinemas, 207 booking links, 52 formats). The Veezi and Lagocine pages for Silverbird Ikeja agree on all 70 start times.
- `npm run refresh -- --fixtures` run for real: 14 files, largest 10.3 KB gzipped for a full two days (limit 20). `node scripts/tmdb.ts --dry-run`: 31 films to look up, no network.
- `/code-review --fix` ran twice (one background helper each, about 100k and 147k tokens). First: 10 findings, 7 fixed (credits shape checked, missing link or price becomes null, reused showing ids dropped, more tracking parameters, log order). Second: 8 findings, 4 fixed (a show after midnight no longer counts as a saved tomorrow, a format written only in the title is kept, `--now` is checked, one duplicate constant removed).

**Not verified**
- **TMDB: nothing has been asked of the live API** (no key). The script's tests use TMDB's documented response shapes. D2-4 is not passing.
- Review findings left open: fields the validator does not check behind its type (source `url` and `health`, cinema `sourceIds`, `via.url`); Veezi's year guess fails on a page that still lists yesterday; a cinema with a mistyped area would be missing from every area file with no warning; `writeFiles` never deletes a file for an area that has gone.
- The build stamp as "when Lagocine read the cinema" is an inference (D-45 d).
- No fresh-context verifier ran (the two reviews were the only helpers). Nothing on screen yet uses the data.
- Poster source and cost: not decided; it needs the TMDB key to measure.
- The neighbouring-areas draft was written from general knowledge, not checked on a map.

**Next**
- Chime: the TMDB key; a yes on the neighbouring areas.
- Day 3: the home screen. Decide how a build gets fresh sample data (a `prebuild` step, plus something that rebuilds daily, or the deployed demo empties after a day).

## Day 1, core lane: time, wording and the calendar file (Wed 11 Nov 2026, late night)

**Changed**
- `src/lib/time/`: `lagos.ts` (UTC to Lagos, the one local-to-UTC function, day and evening helpers), `showingState.ts`, `countdown.ts`.
- `src/lib/wording/`: `freshness.ts`, `credits.ts`, `showing.ts` (the row line and the full screen-reader sentence).
- `src/lib/ics/ics.ts`: the Remind me calendar file and its file name. `src/lib/data/types.ts`: the credits and via shapes.
- D-44 records the cases the docs left open.

**Red first**
- Each test file failed with "Cannot find package '@/lib/...'" before its module existed (lagos, countdown, freshness, credits, showing, ics).
- `credits.test.ts` › "no Go with a checked date that is not a UTC time" failed with "Not a UTC time ending in Z: \"5 Nov\"" (a crash) before `citable()` was made safe.
- One correction to a new test, not to behaviour: its expected error text had a lower-case "not" where the message says "Not".

**Checked**
- Unit: 154 pass (125 new). Each feature's verify command passes: `lib/time` 56, `lib/wording/freshness` 23, `lib/time/showingState` 29, `lib/wording/credits` 18, `lib/ics` 14.
- A generated .ics file parsed with an independent library (Python icalendar): start 18:30 UTC, duration 2 h 17 min, alarm 30 min before, accented and escaped text intact, longest line 75 bytes.
- Lint and typecheck clean.

**Not verified**
- The .ics file opened in iPhone Calendar and Google Calendar (Day 5 gate, needs Chime's phone).
- Nothing is on screen yet: these are functions with tests; the pages that use them start on Day 3.
- No fresh-context or automated code review was run (cost rule: no helper agents without asking).

**Next**
- Day 2: data types and validator, the Lagocine and Veezi parsers, sample data on today's dates, TMDB matching (needs Chime's TMDB key).

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
