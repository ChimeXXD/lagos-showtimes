# Handoff: read this first when you pick the project back up

## Now: the theme switch follows Rune Icons (Fri 13 Nov 2026, afternoon)

Read this section first. Everything below it is background; where they disagree, this is right.

### Start here next time
1. **Ask Chime how the new switch feels on the phone** (D-60). The comparison page (Rune's frames above ours, a tappable copy at full and quarter speed) was in the session scratchpad, not the repo.
2. **Ask Chime what is next on the review.** Done so far: the tab order (D-55), phone search, the phone chips, the Cinemas tab (D-56, D-57), the light/dark switch (D-58) and its motion (D-60). Chime is happy with the Films, film and Starting soon pages for now.
3. **Open questions with Chime:**
   - Should the switch get a third state, "follow my phone"? Once tapped, there is no way back to the phone's setting.
   - Should the phone pickers go on the Films page and film pages? Chime said Cinemas only for now.
   - Should a saved cinema with nothing more today stay under "Your cinemas"?
4. **How to work with Chime here:**
   - Show results visually, before and after, opened in Dia.
   - Mockups are not builds: nothing goes into the app until Chime says build. ("Let's just use it" with a reference counts as build.)
   - For motion, show the options side by side and playing, with a quarter-speed control.

### What happened this session
- Chime's recording of runeicons: the page cuts in one frame; only the icon moves (shrink, blur and fade out; grow, sharpen and fade in), about 8 frames. The four motion options (`mockup/theme-motion/`) are dropped.
- Built (D-60): no view transition; other transitions off for the switch (`theme-cut`); the icon shows the theme on screen; new sun and moon glyphs; the switch styles moved to `src/styles/theme-switch.css`.
- Checks: theme.spec 11 pass, 384 unit tests, lint and types clean; frames compared with Rune's at 60 fps; code review fixed a test race and an off-centre moon.

### Known faults and things not verified
- Nothing checked on a real phone: the sheets, the search keyboard, the switch.
- When the phone's own setting flips with no choice kept, colours fade across over 150 ms (unchanged from before).
- "Your cinemas" lists only saved cinemas with showings left.
- The freshness line joins one line per source, so it could get long with live data.
- Search lists films with no showings left today.
- Old `/films` links give a "page not found".
- Still open from before: the About page with the TMDB notice, a daily rebuild, live data, "Remind me" after a showing starts, the Kids and Nollywood filters, the font pick.

## Earlier: the circle reveal and four motion options (Thu 12 to Fri 13 Nov 2026, past midnight)

The motion parts are superseded by D-60 above: Chime rejected the circle (D-59) as their portfolio's style, four options were made in `mockup/theme-motion/index.html`, then Chime sent the Rune Icons reference instead.

### What happened this session, in order
1. **Fixes from the first recording (D-55):**
   - The tabs read Films, Cinemas, Starting soon, and `/` is Films (`/films` is gone).
   - The phone search button opens a search box with matching films.
   - The area chips wrap instead of being cut off, and "Starting soon" stays on one line.
2. **Cinemas tab redesign:**
   - Round 3 references (`docs/design/reference-board/round3-cinemas.html`, local only). Chime picked Instacart's list and its web layout.
   - Mockup rounds 1 and 2 (`mockup/cinemas.html`). In the second round Chime asked for better phone filters, centred logos, Magnificent's real logo and better spacing on desktop. Chime also said: "Vet all this design before you show me."
   - Chime picked Option 1, one row of pickers (D-56), then answered the open points (D-57): real logos with a removal route, Cinemas page only, and Leisure Mall merged into Filmhouse Surulere.
3. **Built (D-56, D-57):**
   - logo rows, and phone pickers that open sheets
   - 12 chain logos (`public/logos/`, sources in `data/logos.json`)
   - a footer line on having a logo removed
   - the freshness line under the first heading
4. **Light/dark switch (D-58):**
   - A round button beside search on every screen. It follows the phone until tapped, then keeps the choice (`ls.theme`).
   - A head script in `layout.tsx` applies the kept choice before the first paint, browser bar included.
   - Also fixed: the phone picker labels were cut short at 360 and 320 px.
5. **Switch motion (D-59):** Chime found the instant switch "stagnant". I built a circle reveal using the browser's view transitions, with the icon turning a quarter. Chime then rejected the circle as their portfolio's style, and the four options above were made.
6. **The test build makes its sample data as of 08:00 Lagos**, locally (`playwright.config.ts`) and in CI. A late-evening build drops the day's ended showings, and two HTML tests failed; that broke CI twice.
7. **Memory:** the Mac sat near the memory guard's limit (78%). Browser test runs were refused twice until Chime closed Brave and Dia. Run browser tests one file at a time.

### Where it stands
- **Live:** https://sinima-app.vercel.app. The last app change is `f837df7` (the circle motion); `55fbc40` adds the pick page. CI was green on every push since `a7ff565`.
- **Checks:**
  - 384 unit tests pass.
  - The full browser suite passed on the last app commit, with 11 theme tests.
  - The heaviest page is 188.7 KB of 200.
  - 29 of 43 features pass.
- **Code map additions:**
  - `src/components/CinemaRow.tsx`, `Pickers.tsx`, `Search.tsx`, `Tabs.tsx`, `ThemeToggle.tsx`
  - `src/styles/cinemas.css`
  - `rowWarning` in `src/lib/wording/freshness.ts`
  - `THEME_KEY` in `src/lib/area.ts`
  - `--color-tile-*` tokens

### Known faults and things not verified
- Nothing checked on a real phone: the sheets, the search keyboard, the switch, and the motion. View transitions need iOS 18; older iPhones switch at once.
- "Your cinemas" lists only saved cinemas with showings left.
- The freshness line joins one line per source, so it could get long with live data.
- Search lists films with no showings left today.
- Old `/films` links give a "page not found".
- `src/styles/sinima.css` is 301 lines, just over the guideline of about 300. Move the theme switch rules out when the motion changes.
- Still open from before:
  - the About page with the TMDB notice
  - a daily rebuild
  - live data
  - "Remind me" after a showing starts
  - the Kids and Nollywood filters
  - the font pick

## Earlier: the redesign went live (Thu 12 Nov 2026, evening)


Read this section first. Everything below it is background; where they disagree, this is right.

### Start here tomorrow
1. **Ask Chime for the list of fixes.** Chime's last words: "I like it, it's a good starting point, but there are a lot of things we need to fix." The list has not been given yet. Do not guess it. Collect it, say it back in a table, then fix it item by item.
2. Fix against the live site (https://sinima-app.vercel.app) and the approved mockup (`mockup/index.html`, draft 4). Keep the layout, the Lagoon colours and the motion unless Chime says otherwise.
3. Show results visually (screens side by side, opened in Dia), not as terminal text.

### What happened this session, in order
1. **Day 2, the data** (D-45 to D-47): data format and validator, Lagocine and Veezi parsers, `refresh --fixtures` (sample data on today's dates), TMDB matching with Chime's key. All committed.
2. **Day 3, a first home screen** was built and went live. **Chime rejected it as a design** (D-49): one showing per row on desktop, empty poster boxes, an area dropdown, nothing of the references in it.
3. **Structure first:** a designed PDF, `docs/design/structure/Sinima - Sitemap and user journey (draft 2).pdf`. Chime approved it and all six decisions in it: Cinemas is home, area as chips, a panel per showing, day tabs not weeks, Starting soon as a tab, uncovered cinemas still listed.
4. **Format filter added** as a key feature (D-50): find a film by IMAX, 4D or 3D and by area.
5. **Second reference board** (`docs/design/reference-board/round2.html`, local only): 44 shown, 21 liked, 7 "Not for us". Picks are in `docs/design/REFERENCES.md`. Chime's instruction: follow the picks closely.
6. **Four mockup drafts** in `mockup/`: (1) Danfo colours: layout liked, yellow not; (2) restyled after cofounder.co: rejected; (3) draft 1 again with draft 2's motion; (4) Lagoon colours with a true dark mode: **approved** (D-52, D-53).
7. **Built into the app and deployed** (D-54), commit `df40dda`. A code review at high effort found ten faults; all ten are fixed.

### Where it stands
- **Live:** `/` and `/area/[slug]` (cinemas, soonest first), `/cinema/[id]`, `/films`, `/film/[slug]`, `/soon`; the showing panel (side panel on desktop, sheet on a phone); Share (tilted card, Share, Copy link, WhatsApp); Remind me (.ics); format, area and day filters; hearts and "Your cinemas".
- **Design:** Lagoon in light (Foam page `#eef6f4`, Sea mist `#d9ebe7` where white would be, Lagoon text `#0c3b47`, Teal `#0b6e69` primary), true black in dark with Sea mist text and Teal `#5fd4c8`. Dark mode follows the phone. Fonts: Geist for text, Anton for poster titles and the share headline, both cut down (21.6 KB together).
- **Code map:** tokens `src/styles/tokens.css`; component styles and motion `src/styles/sinima.css` (class names match `mockup/mockup.css`); boards in `src/components/` (`CinemasBoard`, `CinemaBoard`, `FilmsBoard`, `FilmBoard`, `SoonBoard`); shared `Cards.tsx`, `Filters.tsx`, `Showing.tsx`, `Share.tsx`, `Poster.tsx`, `Shell.tsx`; data helpers `src/lib/data/programme.ts`, `format.ts`, `select.ts`; day wording `src/lib/wording/day.ts`.
- **Data:** still sample data from the 11 Nov Lagocine pages; every Book button reads "Sample only". 15 of 31 films have a TMDB poster; the rest get a title poster.
- **Checks:** 366 unit and 44 browser tests; heaviest page 188.0 KB of 200. CI green on `df40dda`. 26 of 40 features pass.
- **The gate:** `.claude/proof.json` runs typecheck, browser tests and budget in order as one check. Chime pre-approves every change to that file; do not ask.

### Open with Chime
- **The fix list** (see Start here).
- **Font:** never picked. Geist is in because the mockup showed it. Six free options are in the mockup's top bar.
- **TMDB hand matches:** Ikenga and Verity are unmatched; Ramayana was matched to "Ramayana: Rise of a Legend" by assumption.
- **The wordmark:** should tapping "Sinima" go to the saved area instead of all of Lagos?
- **Title posters** use deep teal and navy in dark mode too; Chime dislikes a green tint in dark mode and has not commented on these.

### Not built yet
- About page with the TMDB notice (required before launch, D-09).
- Kids and Nollywood/Hollywood filters; "Save image" on the share sheet; the WhatsApp preview image; offline; "Use my location".
- A daily rebuild: the sample site empties two days after each deploy.
- Live data (Lagocine, Day 6 of the plan, D-33).

### Known faults and things not verified
- "Remind me" is still offered after a showing has started.
- Nothing has been checked on a real phone; the motion was not watched by eye in the app; no screen reader pass.
- The fresh-context verifier did not run on the final build (the Mac was at its memory ceiling; closing Dia and Brave frees about 8.9 GB).
- Font sizes are written in `sinima.css`, not as tokens. `validate.ts` does not check `posterPath`. Unused helpers remain (`filmCounts`, `soonCount`, `nextDayName`, `loadArea`, `showingLine`, `showingSentence`).
- A title with a letter outside Anton's cut-down set falls back to Geist on its title poster.

### How Chime works (learned this session; the earlier lists below still hold)
- **Judges by looking.** A design is only real once Chime has seen it. Function passing is not design approval.
- **Follow the picks.** Under each mockup screen, list which references it follows and what was taken from each.
- **Change only what was asked.** "Keep the layout, change the colours" means exactly that. The cofounder.co restyle went further than asked and was rejected.
- **Say it back first.** For a big request, write what was understood and the plan in a table before starting.
- **Documents must look designed** (the structure PDF is the standard).
- **Dictation is loose:** "downfall" meant Danfo; "D9EB7" meant `#d9ebe7`; "start day one" meant the next day.
- **Standing yeses:** automated reviews (one helper at a time), and every `.claude/proof.json` change.
- **Chime thinks out loud and reverses.** A pick is a shortlist until Chime says "approved" or "go with it".

## Earlier: the redesign in progress (Thu 12 Nov 2026)

**Read D-49 first.** Chime rejected the Day 3 home screen as a design. The plan's Day 4 is on hold.

- **Approved:** the structure in `docs/design/structure/Sinima - Sitemap and user journey (draft 2).pdf` (source: `sitemap-and-journey.html` beside it; re-render with Playwright's `page.pdf`). Cinemas first, Films and Starting soon as tabs, area as chips, a panel per showing, day tabs.
- **With Chime now:** `docs/design/reference-board/round2.html`, 44 references in six sections for the new structure (local only, like the first board; answers come back by "Copy all answers"). Chime's share pick from round one (Fixtured) leads the Share section and must go into the app.
- **Mockup (12 Nov):** `mockup/index.html`, draft 3 (D-52): draft 1's design with draft 2's motion. Chime rejected draft 2's cofounder.co style. Draft 4 puts it in Lagoon colours with a true dark mode (D-53). Waiting for Chime on the colours and the font. Posters and fonts under `mockup/` are local only. Still to design after that: Films tab, Starting soon tab, empty and error states; then test IDs, `interactions.json` and the proof design check before any build.
- **Next, in order:** (1) read Chime's answers into `REFERENCES.md`; (2) a font page: free fonts close to TT Neoris (cofounder.co's, paid), each on the same real screen; (3) Danfo colours on real screens, light and dark, contrast checked; (4) two or three full mockups, desktop and phone side by side, real posters, for Chime to pick; (5) only after "go with it": rebuild, checked against the mockup.
- **Posters:** never an empty box. TMDB poster where matched (14 of 31), hand matches next, and a designed title poster for the rest. Real posters for unmatched Nollywood films would need a rule change (posters from films' official pages) or Chime adding them to TMDB.
- **How Chime wants things shown:** documents as designed PDFs, not plain pages; references on a board to tick; say back what was understood before starting.
- **Format filter (D-50):** find a film by format (IMAX, 3D, 4D) and area; only Filmhouse rows carry a format today. It is page 9 of the structure PDF, now draft 2.
- **`.claude/proof.json`:** Chime confirms every change to it in advance (12 Nov); do not ask. It now runs typecheck, browser tests and budget in order as one check.

## Earlier: Day 3 as built (Wed 11 Nov 2026, night)

Read this first, then the Day 2 section under it for the data pipeline. Where they disagree, this one is right.

- **Built:** `/`, `/area/[slug]`, a plain `/film/[slug]`; showing rows, sections by the clock, area picker with a remembered area, "Now showing" with a filter, empty state with neighbouring areas, sample and stale banners. Details and open cases: D-48 and the Day 3 entry in `PROGRESS.md`.
- **Checks:** 324 unit and 32 browser tests pass. 23 of 40 features pass; D3-3 (Chime approves on the phone) is the one Day 3 item left.
- **Waiting for Chime:** a poster pick (`docs/design/direction-board/posters.html`; its poster images are local only, in the git-ignored `images/posters/`); a look on the phone; whether the wordmark should go to the saved area; three TMDB hand matches (Ikenga, Ramayana, Verity).
- **The gate:** `.claude/proof.json` now runs typecheck, then the browser tests (which build the site), then the budget as one check, in that order (Chime's OK, 11 Nov). Before, three checks built or read `.next` at once and the typecheck failed at random.
- **Risks to deal with:** `/` weighs 195.7 KB of 200 with a full programme, so it must carry less before live booking links arrive; the site empties two days after a build; type sizes in components are not tokens; Vercel has not yet been seen running the prebuild step.
- **Do next (Day 4):** film page grouped by area with the Stay or Go tile, cinema page, "Started 5 min ago" rows with no Book link, then the Should items. Wire in posters once Chime picks.

## Earlier: Day 2 (session of Wed 11 Nov 2026, evening to night)

Read this section first. The sections below are background; where they disagree with this one, this one is right. Design, name, working style, cost rules and "watch out for" in the Day 1 section still hold.

### Where it stands
- **Data format and validator** (D2-1): `src/lib/data/types.ts`, `validate.ts`. Every rule in DATA.md §Rules is enforced and tested.
- **Parsers** (D2-2): `scripts/sources/lagocine.ts` (day page and cinema page) and `veezi.ts`, on three cut-down fixtures listed in `tests/fixtures/index.json`.
- **Sample data** (D2-3): `npm run refresh -- --fixtures` writes `data/showtimes.json`, `public/data/all.json` and `public/data/area/<slug>.json` (12 areas) on today's and tomorrow's dates in Lagos. 294 showings a day across 20 cinemas and 31 films. **These files are git-ignored** (D-45): run the command to make them.
- **Credits** (D2-4): `node scripts/tmdb.ts` ran against TMDB with Chime's key. 14 of 31 films matched (all checked by eye); 2 have a credits answer. `data/credits.json` is committed; `refresh` puts the answers on films. The key in `.env.local` is TMDB's short API key, which the script accepts (D-47).
- **Checks:** 301 unit tests and 10 browser tests pass; home page still 162.1 KB of 200 (nothing on screen uses the data yet).
- **Features:** 19 of 40 passing (Days 0, 1 and 2). **Decisions:** D-01 to D-47. Open: O-3, O-7. The neighbouring areas are confirmed and in `data/cinemas.json` (D-46).

### Do next
1. **Posters:** sizes are measured (D-47). On Day 3 show Chime rows with 92 px and 154 px posters and the title tile side by side, then decide. Only 14 of 31 films have a poster.
1. Ask Chime about three hand matches for `data/tmdb-overrides.json`: Ikenga, Ramayana, Verity (see `PROGRESS.md`).
2. **Day 3, the home screen** (`docs/PLAN.md`): `/area/[slug]` and `/`, showing row, area picker, "Now showing" list, empty state, banners. Follow the proof build skill's mockup steps: tokens and shared components first, one screen at a time.
3. **Fresh sample data on every build:** add a `prebuild` step that runs `refresh --fixtures`, and something that rebuilds the site each day (a scheduled GitHub Action is free). Without it the deployed demo shows nothing a day after a deploy.
5. Still to draw: the doodle character and the "nothing showing" screen.

**Needs from Chime**
- The GitHub secret `TMDB_READ_TOKEN` (the same value as in `.env.local`), before the scheduled refresh goes live.
- Nothing more on reviews: Chime said yes to automated reviews (D-46). Run `/code-review --fix` after code changes and the verifier once per unit; still ask before launching several helpers at once. `.env.local` exists (copied from `.env.example`) and is waiting for the token.
- Open the site on the phone, and try adding it to the home screen.

### Found this session
- **Lagocine repeats rows:** 59 of the 353 rows on its 11 Nov day page are exact repeats (all Genesis). Each is counted once.
- **Veezi and Lagocine write some titles differently** ("AGBARA NLA" / "Agbara Nla: The Return"), so film ids from titles alone will not join two sources. Sample data uses Lagocine only. A second live source would need TMDB ids or an alias list first.
- Lagocine's page carries a build stamp (`lagocine-built`); it is used as "when Lagocine read the cinema", which is an inference.
- The commit gate once failed the typecheck while the build was rewriting `.next/types`; it passed on its own and on the retry.

### Not verified
- Review findings left open, listed in `PROGRESS.md` (unchecked fields behind the validator's type; Veezi's year guess; a mistyped area slug; old area files never deleted).
- Live booking links will make data files heavier than the 10.3 KB measured; the limit is 20 KB.
- Everything in the Day 1 list below that needs a real phone.

## Earlier: Day 1 (session of Wed 11 Nov 2026, afternoon to night)

Background. Its "Where it stands" and "Do next" lists are out of date; use the section above.

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
- The GitHub secret `TMDB_READ_TOKEN` (the same value as in `.env.local`), before the scheduled refresh goes live. Claude cannot enter keys.
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
