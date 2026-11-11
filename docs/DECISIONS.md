# Decisions

Written 6 Nov 2026 from the PRD, the research of the same day and what Meridian and Agmen (Tactics Board) taught us. Claude CLI treats them as fixed. To change one, add a new entry that supersedes it rather than editing the old one.

## Frame

| ID | Decision | Why |
| --- | --- | --- |
| D-01 | **Portfolio project.** Built with Claude Code in about one week. The repo is **private** while we build and goes **public** (MIT) on launch day (Day 7), deployed on a free host. **Budget: $0.** No ads, no fees, no commission. | Same frame as Meridian, which shipped in a week. Non-commercial use also keeps TMDB and Vercel Hobby free (PRD, Data access). |
| D-02 | **A web app**: Next.js 16.4.3 App Router, static export, React 19.3.1, TypeScript 5.9.3, Tailwind 4.3.3, ESLint 9, Playwright 1.64.1, Node 22. | Chime's call: it must be a web app. The versions match Chime's portfolio, so nothing new to learn and the case study sits beside it. Static pages are cheap, fast and free to host. |
| D-03 | **Two dev dependencies beyond the portfolio's: Vitest (unit tests) and cheerio (HTML parsing in fetch scripts only).** Nothing else without Chime's OK. | Tests first needs a fast unit runner; Playwright alone is slow for time and wording tests. Parsers need a real HTML parser; regex on HTML breaks. Neither ships to the browser. |

## Honesty (borrowed from Meridian)

| ID | Decision | Why |
| --- | --- | --- |
| D-04 | **Every showing shows its source and age in words**: "Read from Filmhouse's site 2 hours ago". One function, `lib/wording/freshness.ts`, writes every such sentence. Bands and wording are in `docs/DATA.md`. | Meridian's lesson: "trust was the product". Showtimes change; saying when we read them is the honest answer. Lagocine already labels old data, so this is the bar, not a bonus. |
| D-05 | **Showing states: upcoming, starting (0–10 min before), started, ended.** Started showings lose their booking link and leave "Starting soon"; ended ones are hidden. Computed in the browser from `now`. | A static page can be hours old. Showing a started film as bookable would send someone across Lagos for nothing. |
| D-06 | **Times stored in UTC, shown in Africa/Lagos, 24-hour clock**, always through `Intl` with an explicit zone. | Meridian's time-zone bugs were caught by tests first. Lagos has no DST, which hides bugs until a visitor or CI runner is in another zone. |

## Data

| ID | Decision | Why |
| --- | --- | --- |
| D-07 | **Permission first.** On Day 0 Chime emails Lagocine and the chains (`docs/OUTREACH.md`). A data-sharing agreement with Lagocine is the preferred source. | Lagocine already reads 20 cinemas daily and takes no commission. Asking is polite, cheap and the strongest story for the case study. |
| D-08 | **Fallback: a polite scheduled fetch, per source, only once cleared.** A source is `cleared` in `data/sources.json` when it has written permission, or its robots.txt allows the path and its terms (read and quoted) do not forbid automated access. Rules: obey robots.txt, ≤ 1 request per 5 s per host, named user agent with contact URL, public listing pages only, stop the day we're asked. The refresh workflow ships disabled. | Respects owners and Nigerian law (not legal advice; PRD §Data access). Until a source is cleared, saved fixtures drive the build, with a "Sample data" banner. |
| D-09 | **TMDB at build time only, non-commercial, with attribution.** The `/about` page shows the TMDB logo and "This product uses the TMDB API but is not endorsed or certified by TMDB." | TMDB FAQ terms (PRD). Keeps the key off the client and calls off users' data plans. |
| D-10 | **Stay or Go from TMDB keywords `aftercreditsstinger` (179430) and `duringcreditsstinger` (179431)**, with confidence words: a keyword present = "Stay" + source; no keyword = **"Not known yet"**, never "Go". "Go: nothing after the credits" needs a source that says so (a manual entry with a link, or crowd confirmations later). | A missing tag is not evidence. Meridian's rule: say how sure you are. RunPee and aftercredits.com have no open API we can use; we only link to them. |
| D-11 | **Reminders this week are an .ics file and an on-page countdown. Web Push is Phase 2.** | .ics works on every phone with no install. iOS Web Push needs a Home Screen install (WebKit), and sending at a set time needs a server and stored subscriptions, which breaks $0 and no-accounts this week. |
| D-12 | **Page weight budget**: home ≤ 150 KB transferred on first load (≤ 90 KB JS gzipped), `showtimes.json` ≤ 60 KB gzipped, posters off in data-saver mode (default when `navigator.connection.saveData` is true). CI enforces it. | Data costs rose 50% in Jan 2025 and use dropped (PRD). Fast on 3G is the product. |

## Design and process

| ID | Decision | Why |
| --- | --- | --- |
| D-13 | **Design phase first** (Day 1). References into `docs/design/REFERENCES.md`; three directions on an HTML direction board; Chime picks one; then `UI-BRIEF.md` §1–3 and `tokens.css`. Reference screenshots stay local (git-ignored). | Worked on Meridian and Agmen. |
| D-14 | **Day 1 runs two lanes**: design direction (Chime's picks) and the core, tests first (`lib/time`, `lib/wording`, `lib/data` types and validator, `.ics`). They touch different files. | Agmen D-23. The core doesn't depend on the look. |
| D-15 | **No accounts, no server, no analytics, no cookies** this week. Area and data-saver settings live in `localStorage`. Location is used once, on tap, in the browser. | Privacy and $0. Lagocine sets no cookies either; we should not be worse. |
| D-16 | **"Near me" means areas, not kilometres.** The user picks an area; "Use my location" just picks the nearest area by straight-line distance to cinema coordinates. We never promise travel times. | Lagos traffic makes any travel-time guess wrong. Areas are how Lagosians already think ("Lekki", "Ikeja"). |
| D-17 | **Repo `ChimeXXD/lagos-showtimes` until the name lands**; rename before the repo goes public. | Renaming before launch costs little; after, it breaks links. |

## Plan review (11 Nov 2026)

From `docs/PLAN-REVIEW.md`. Chime said yes to all on 11 Nov 2026.

| ID | Decision | Why |
| --- | --- | --- |
| D-18 | **One static page per area. `/area/[slug]` is the "Starting soon" page for that area; `/` is the same view for all of Lagos** and sends a returning visitor to their saved area. The static HTML holds a plain time-ordered list with absolute times; the client regroups it into Starting soon, Later tonight and Tomorrow. Showings data is split per area. | The area lives in `localStorage`, which static HTML cannot see, and the sections depend on `now`. A page per area keeps the list in the HTML and keeps each page's data small. Refines SPEC §5 and UI brief §4.1 and §4.5. |
| D-19 | **Credits wording: one named source that says there is a scene gives "Stay: scene after the credits · TMDB".** "Probably stay" is kept for answers we infer. **`data/credits-manual.json`** holds Chime's own entries, each with a link and the date checked; it is the only way "Go" appears. The build log reports the share of films with an answer. Supersedes the two-source rule in `DATA.md` §Credits wording; the rest of D-10 stands. | `DATA.md` and `SPEC.md` disagreed. TMDB is the only machine-readable source, so a two-source "Stay" could never appear, and a TMDB tag is a person's positive statement. |
| D-20 | **Sample data sits on today's dates.** `refresh --fixtures` keeps each fixture's wall-clock times and moves its dates onto today and tomorrow in Lagos. The "Sample data" banner and "Sample only" buttons stay. Tests use the fixtures unshifted with a frozen clock. | Ended showings are hidden, so fixtures saved on Day 0 would leave every page empty from Day 1. |
| D-21 | **The page-weight budget is set from a Day 0 measurement** of the empty scaffold: measured baseline plus a fixed allowance for our code and data, logged as a new decision when measured. Supersedes the numbers in D-12; the rest of D-12 (CI enforces it, posters off in data-saver mode) stands. | D-12's parts summed to its total (90 KB JS + 60 KB data = 150 KB) with nothing left for HTML and CSS, and the framework's own JS may already exceed 90 KB (not yet measured). |
| D-22 | **Scope added. Must:** a "Now showing" film list on home with a filter-as-you-type box; neighbouring areas offered in the empty state (a hand-written list Chime confirms, no distances); D-19's manual credits file; D-20. **Should:** "Runs 2 h 10 min · out about 21:40" when TMDB gives a runtime; a "Report a wrong time" link; a share link that opens on the exact showing; "My travel time" (already a Should). | SPEC flow 2 needed a way to find a film and none existed. Eight of twelve areas have one cinema, so "Starting soon" there is often empty. |
| D-23 | **Launch tiers.** A: Lagocine feed. B: one or more sources cleared by robots and terms; other cinemas listed as "not covered yet". C: nothing cleared; the site is a demo on sample data and says so in the README and on every page. The Day 0 audit, not the emails, is the main route to real data this week. Name the tier on Day 2 (with O-5). | Emails were due 6 Nov and chains rarely answer in a week. Day 7 must be honest whichever tier we reach. |
| D-24 | **Fixtures are cut down before commit** to the listing markup the parser reads (titles, times, links), with a note of what was removed. Full saved pages stay in the git-ignored `tmp/`. | The repo goes public on Day 7, and a full saved page carries the posters and synopses D-08 says never to copy. |
| D-25 | **Clarifications.** (a) The hours freshness band runs from 1 h to under 6 h. (b) `DATA.md` defines bookable: Stale rows can be booked, Old rows cannot. (c) `data/tmdb-overrides.json` holds hand-kept TMDB matches; an unmatched or ambiguous title stays "Not known yet". (d) The service worker is network-first for pages and data, with the cache as the offline fallback. | (a) 5 h 30 min was undefined. (b) SPEC §3 and `DATA.md` differed. (c) A wrong match puts the wrong credits answer on a film. (d) Cache-first pages would keep serving an old build. |

## Day 0 findings (11 Nov 2026)

| ID | Decision | Why |
| --- | --- | --- |
| D-26 | **Budget numbers (provisional until Chime confirms, O-9): each page ≤ 160 KB of gzipped JS and ≤ 200 KB gzipped in total, counting its HTML, CSS, JS and its own data file.** Legacy `nomodule` polyfills are not counted. Held in `scripts/check-budget.mjs`. | Measured on the empty scaffold on 11 Nov 2026: 131.9 KB JS, 2.4 KB CSS, 1.9 KB HTML, 136.1 KB in total (gzip level 9; a host using brotli sends less). D-12's 90 KB JS limit was below what the framework ships with no code of ours. The allowance is about 28 KB of JS and about 36 KB for HTML, CSS and one area's data. |

| D-27 | **Host: Vercel Hobby.** Closes O-4. Until the repo is public, the refresh workflow commits under Chime's GitHub identity so deploys are not blocked (O-8). | Chime's call, 11 Nov. The portfolio is already there. |
| D-28 | **The budget in D-26 is confirmed: 160 KB JS and 200 KB total per page, gzipped.** Closes O-9. | Chime left the numbers to Claude, 11 Nov. They sit just above the measured empty app, so the limit still catches growth. |
| D-29 | **A site whose robots.txt carries the `use=reference` signal needs a written yes before we use its data.** This covers Genesis and silverbirdcinemas.com, as it already did Showtimes NG. Silverbird's Veezi pages do not carry the signal and are judged on Veezi's own robots.txt. Closes O-11. | Chime's yes, 11 Nov. One rule for every source that sends the same signal. |

| D-30 | **The repo is public from Day 0 (11 Nov 2026), not private until Day 7.** Supersedes that part of D-01, D-17 and L-6. The site still launches on Day 7; the README says it is a work in progress until then. Rename the repo when the name lands (O-1); GitHub redirects the old address. | Chime's call. GitHub would not run Actions on the private repo without a working payment method, and the budget is $0. Public repos run Actions free. It also removes the Vercel bot-commit problem (O-8). The cost: the unfinished work and the build log are visible from the start. |

| D-31 | **TMDB's API terms are read; closes O-6.** What they require of us: non-commercial use only (section 2.A); never cache TMDB data for longer than 6 months (1.C), so `data/credits.json` is re-fetched at least that often (the weekly re-check covers it); the TMDB logo and the not-endorsed notice shown prominently (section 3); nothing that misleads about where the data comes from. No rate limit is stated. Chime still needs a free API key before Day 2. | Claude read https://www.themoviedb.org/api-terms-of-use on 11 Nov 2026 after Chime asked to move on from reading it. |
| D-32 | **Audit result (11 Nov 2026): no source can be cleared on robots and terms alone.** Lagocine is readable but is another person's compiled work (asked). Filmhouse and EbonyLife put no times in their HTML. Genesis needs a written yes (D-29). Silverbird's Veezi page is readable, but Silverbird's own terms forbid copying its content or linking to its site without written permission (O-12). So the site is tier C (sample data, D-23) until a reply arrives. The one fixture is Silverbird Ikeja's Veezi listing, cut down (D-24). | Each finding is quoted in `data/sources.json`. Being plain about it now keeps Day 7 honest. |

| D-33 | **Lagocine is the live source, switched on at Day 6 with full credit unless it has objected by then. No more permission emails.** It passes D-08's own test (robots.txt allows everything; no terms forbid automated reading). Every row says "From Lagocine, which read <cinema>'s site ..." and links back; at most 3 reads a day; we stop the day it asks. Chime confirms the change to `cleared` on Day 6. Supersedes the "permission first" part of D-07 and settles O-5 (coverage: the cinemas Lagocine lists) and O-12 (Silverbird is not read directly; no email sent). Filmhouse and EbonyLife are never read directly: their times sit behind a data path their rules disallow. A cut-down Lagocine fixture may now be committed (D-24). | Chime's call, 11 Nov: tired of asking, and showtimes are public facts. The cost, accepted: it is a rival's compiled work, the 11 Nov email asked first and may yet get a no, and Lagocine can block us, in which case the site falls back to sample data (tier C). |

| D-34 | **Palette G, with the Book button in a calm blue.** Black and white throughout; the only colour is Book. Light: Book `#2F5FB3` with white text (6.16:1). Dark: Book `#8FB4F5` with `#06142E` text (8.73:1). The other roles are palette G as shown on the reference board. Tokens land in `src/styles/tokens.css` when the direction is picked. | Chime's pick on the reference board, 11 Nov: "I like the colors, apart from the book button. I don't like the book button being red; it's the primary button. Something like a calm blue." Contrast computed with the WCAG formula. |

| D-35 | **Direction B · Poster.** A small poster on every showing row, a rounded typeface (Outfit on the board), black capsules for the area button and main actions, and Stay or Go as its own tile with the source under it. Still to settle inside it: the font file must fit the 30 KB limit (or fall back to the system font), and posters must fit the page-weight budget (D-28) and TMDB's terms (D-31); if they don't, posters stay on the film page only. | Chime's pick on `docs/design/direction-board/pick.html`, 11 Nov 2026, with no changes asked for. |

## Lessons carried from Meridian and Agmen

| ID | Lesson | How it applies |
| --- | --- | --- |
| L-1 | "Trust was the product": every time said how sure it was, in words. | D-04, D-05, D-10. Freshness and credits wording live in one place each and are tested. |
| L-2 | Tests first on time logic caught real bugs. | Tests first for `lib/time`, wording, parsers and `.ics`. Fixed clocks, UTC instants. |
| L-3 | Renders are not enough; a bug only showed on the device. | Check on Chime's iPhone and a mid-range Android on mobile data before each gate. |
| L-4 | A numbered decisions log kept many sessions consistent. | This file. Supersede, never edit. |
| L-5 | Honest numbers read as senior. | Publish real page weights, Lighthouse scores, coverage and permission replies, including misses. |
| L-6 | Private repo until launch day kept the story clean. | Public on Day 7 only, after the name, README and case study are ready. |
| L-7 | Parallel agents collided on shared resources. | One dev server and one Playwright run at a time; Agmen runs in parallel on the same Mac. |

## Open

| ID | Question | Owner |
| --- | --- | --- |
| O-1 | **Final name.** Chime likes **Sinima** (11 Nov) but wants it to feel more Nigerian or Lagosian, and has ruled out Wetin Dey Show and Lagos Showtimes. Ten options around Sinima are on `docs/design/direction-board/names.html`. None is checked for clashes yet; check the one Chime picks. | Chime |
| O-2 | **Data permission status per source** (update as replies arrive). | Chime |
| O-3 | **Push notifications**: Phase 2 as D-11 says, or try a $0 version this week (GitHub Actions cron + stored subscriptions)? Proposal: Phase 2. | Chime |
| O-4 | **Host**: Vercel Hobby or Cloudflare Pages. Proposal: Vercel (portfolio is there; preview deploys). | Chime |
| O-5 | **Coverage this week**: all 20 Lagocine cinemas through Lagocine (if it agrees), or the big four chains direct? Decide when replies arrive (Day 2). | Chime |
| O-6 | **TMDB API terms**: our fetcher could not read the full terms page. Chime reads it on Day 0 and notes anything that limits caching or display. | Chime |
| O-7 | **Abuja and Port Harcourt**: Phase 3 or never? | Chime |
| O-8 | **Does Vercel Hobby deploy commits made by the refresh bot** on a private repo? Checked 11 Nov: Vercel's help page says that on a private repo the person pushing must be the owner of the Hobby team, and forum reports show deploys blocked when the commit author is someone else. No source covers a bot specifically. It stops mattering on Day 7 (public repo); before then the workflow can commit under Chime's GitHub identity. Vercel is still workable. | Chime decides O-4 |
| O-9 | **Budget numbers** (D-21): measured; D-26 proposes 160 KB JS and 200 KB total. Confirm or change. | Chime |
| O-11 | **Genesis and Silverbird's own site carry the same `use=reference` signal as Showtimes NG.** Treat them the same way (written permission only), or read the signal as allowing a listing that links back? Proposal: written permission only. | Chime |
| O-12 | **Silverbird through Veezi.** Veezi's robots.txt allows the listing page and it has no terms, but silverbirdcinemas.com's terms forbid copying and linking without written permission. Proposal: treat Silverbird as needing a written yes, and send it the chain email. | Chime |
| O-10 | **Neighbouring areas list** (D-22): Claude drafts on Day 2, Chime confirms. | Chime |
| O-13 | **Illustrations and the app icon.** Chime wants custom illustrations (starting with the empty state) and a custom icon, with references gathered from Pinterest first. To settle: the style, and how it stays inside the page-weight limit (drawn in code, no downloaded images). Do after the direction is picked. | Chime |

### Data permission status (O-2)

| Source | Robots.txt (11 Nov) | Terms read | Asked | Reply | Status |
| --- | --- | --- | --- | --- | --- |
| Lagocine | Allows all | No terms page found (home links only to privacy) | 11 Nov (contact@lagocine.com) | — | Not cleared |
| Filmhouse (www.filmhouseng.com) | Allows public pages; disallows `/api/` and every `/select-tickets` page | Read `/terms-conditions`: nothing on automated access. Times are not in the HTML | 11 Nov (onlinesupport@filmhouseng.com) | — | Not cleared |
| Genesis (genesiscinemas.com) | Allows `/`, with the content signal `use=reference`, `ai-train=no` | Read: covers ticket sales only, nothing on automated access | Not yet | — | Not cleared (O-11) |
| EbonyLife (ebonylifecinemas.com) | Allows all (no rules) | No terms page. Times are not in the HTML | Not yet | — | Not cleared |
| Silverbird (Veezi) | Veezi allows `/sessions/`, disallows `/purchase/`; silverbirdcinemas.com carries `use=reference` | silverbirdcinemas.com terms forbid copying and linking without written permission (O-12) | Not yet | — | Not cleared |
| Syticks API | `api.syticks.com` did not resolve | No | Not yet | — | Not cleared |
| Showtimes NG | `use=reference`, `ai-train=no` (6 Nov) | n/a | Not planned | — | **Do not use** |
| TMDB | n/a (API) | Full terms read 11 Nov (D-31) | n/a | — | Cleared for non-commercial use with attribution |
