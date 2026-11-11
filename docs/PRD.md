> Written 6 Nov 2026. Decisions in `docs/DECISIONS.md` supersede anything here that disagrees. "Lagos Showtimes" is the folder name and working title; the brand is open (O-1).

# Wetin Dey Show (working name: Lagos Showtimes)

Every Lagos cinema's showtimes in one fast phone page, with when your film starts, where the time came from, and whether to stay for the credits.

## Summary

Lagos is Nigeria's cinema capital, and its box office is growing fast: ₦15.6 billion nationally in 2025, up about 35% on 2024, with Nollywood now level with Hollywood. Showtimes are scattered across chain websites, booking engines and Instagram. Two listings sites (Lagocine and Showtimes NG) already gather today's times, and Lagocine does it well and honestly. What nobody does is answer the evening question: **"What can I catch in the next two hours, near me, and should I stay after the credits?"** This web app answers it in one screen. It carries Meridian's rule: every time says where it came from and how fresh it is, in words. It is a one-week, $0 portfolio build with Claude Code, shipped as an open-source repo and a case study on chimexd.work.

## Problem and audience

People in Lagos decide on a film late, often on the move, and pay for every megabyte.

- **The evening decider.** Off work in Lekki or Ikeja at 18:00, wants a film "tonight, near here". Today they open two or three chain sites, each with its own layout, or scroll a cinema's Instagram.
- **The planner with friends.** Picks a film, then needs one showing that suits everyone, and shares it in a WhatsApp group.
- **Parents.** Need a kids' film at a sensible time near home.
- **Marvel and franchise fans.** Want to know whether to sit through the credits. RunPee answers this, but in a separate US-focused app.

**Evidence**
- Lagos has 51 licensed cinemas, one per about 337,000 people, more than half of Nigeria's exhibition premises ([Intelpoint](https://intelpoint.co/insights/lagos-had-one-licensed-cinema-for-every-337000-people-in-2025)).
- Seven of Nigeria's top ten cinemas by 2025 ticket revenue are in Lagos; Silverbird Ikeja leads with ₦1.12 billion ([Vanguard](https://www.vanguardngr.com/2026/02/top-10-largest-cinemas-in-nigeria-by-ticket-revenue)).
- Times live on many different systems. Filmhouse runs its own booking site, Genesis its own, EbonyLife its own, and Silverbird sells through Veezi. Eight of the 20 Lagos cinemas Lagocine lists have no booking page it could link ([Lagocine: how it gets its showtimes](https://lagocine.com/how-lagocine-gets-its-showtimes/), [Lagocine: cinemas](https://lagocine.com/cinemas/)).
- Data is expensive. The NCC-approved 50% tariff rise in January 2025 took the 1 GB floor price from ₦287.50 to ₦431.25, and data use fell about 10.7% the next month ([Leadership](https://leadership.ng/higher-tariff-forces-many-nigerians-to-reduce-data-usage)).

**When it hurts:** Friday and Saturday evenings, public holidays, school holidays, and opening weekends of big Nollywood and Marvel releases.

## Research findings

**Market**
- Nigeria's 2025 box office was ₦15.6 billion (about $10.4 million) from 2.79 million admissions, up 34.7% on 2024's ₦11.58 billion. Nollywood took 49.4% against Hollywood's 48.8%, the first time Nollywood led ([BusinessDay](https://businessday.ng/news/article/nigerian-box-office-hit-historic-n15-6bn-in-2025-as-nollywood-films-get-more-views-than-hollywood-for-first-time/), from FilmOne's West Africa 2025 scorecard).
- FilmOne's 2025 yearbook counts 122 cinemas and 369 screens (from 91 and 288 in 2023), and forecasts 135 cinemas, 390 screens and ₦20 billion for 2026. The average ticket rose from ₦2,824 (2023) to ₦5,959 (2025) ([Nairametrics](https://nairametrics.com/2026/02/03/nigerian-box-office-eyes-n20-billion-revenue-in-2026-report/)). The article reports these as the West Africa yearbook; Nigeria is about 93% of that box office ([TechCabal](https://techcabal.com/2025/01/30/cinemas-in-nigeria/)).
- H1 2026 reached about ₦8.8 billion, more than any full year from 2019 to 2023. *Michael* (₦790.9 million) and *Call of My Life* (₦686.8 million) led ([BusinessDay](https://businessday.ng/life-arts/article/nigerian-box-office-revenue-reaches-n8-8bn-in-h1-2026/)).
- In 2024 Filmhouse held 28% of the market (₦3.2 billion), Silverbird 19%, Genesis 18%. EbonyLife VI was the top single cinema. Lagos had 36 cinemas in FilmOne's count. 66% of 500 surveyed cinema-goers preferred cinemas to streaming ([TechCabal](https://techcabal.com/2025/01/30/cinemas-in-nigeria/)).
- Most visited Lagos sites in 2024: Silverbird Ikeja (206,440 admissions), EbonyLife VI (138,644), Filmhouse Lekki (133,226), Filmhouse Surulere, Genesis Festac, Genesis Maryland, Filmhouse Ikota, Sky Sangotedo, Filmhouse Circle Mall, Filmworld Ikotun (41,911) ([Nairametrics](https://nairametrics.com/2025/02/01/top-10-most-visited-cinema-locations-in-lagos-2024/)).
- Genesis has 12 locations and 47 screens nationwide ([Genesis Cinemas](https://genesiscinemas.com/?p=79)); its Lekki flagship is in Purple Mall, Freedom Way, Lekki Phase 1 ([ThisDay](https://thisdaylive.com/index.php/2024/12/27/genesis-cinema-opens-lagos-flagship-in-lekki)).
- A sample price list for Filmhouse IMAX Lekki: adult 2D ₦3,500, child 2D ₦2,000; booking is online only at filmhouseng.com. The page is undated, so treat prices as old ([Legit.ng](https://www.legit.ng/1260453-imax-lekki-ticket-bookings-contacts-address-opening-hours-ticket-prices-website.html)).

**How showtimes are published (6 Nov 2026)**
- Filmhouse booking links are per film, date and site: `filmhouseng.com/movies/<film>/showtimes/<date>/<site>/select-tickets?showtime=<id>` ([Lagocine: cinemas](https://lagocine.com/cinemas/)).
- Genesis uses `genesiscinemas.com/<site>/booknow/<id>`; EbonyLife uses `ebonylifecinemas.com/movies/<uuid>?showTimeId=…`; Silverbird uses Veezi (`ticketing.eu.veezi.com`) ([Lagocine: cinemas](https://lagocine.com/cinemas/)).
- Silverbird Galleria's Veezi page showed "No shows currently scheduled" on 6 Nov ([Veezi](https://ticketing.eu.veezi.com/sessions/?siteToken=4x3z2wcre0rek2beab5w344ae0)).
- Most cinemas publish only two or three days ahead ([Lagocine: how](https://lagocine.com/how-lagocine-gets-its-showtimes/)).

**Credits scenes**
- TMDB tags films with the keywords `aftercreditsstinger` and `duringcreditsstinger` ([Kodi Stinger add-on](https://github.com/rmrector/service.stinger.notification)). Their IDs are 179430 (after) and 179431 (during), read through `append_to_response=keywords` on movie details ([Raymond Camden](https://www.raymondcamden.com/2026/03/28/checking-if-a-movie-has-a-post-or-mid-credit-scene)). The 179430 keyword page lists films such as *Deadpool & Wolverine* and *Inside Out 2* ([TMDB](https://www.themoviedb.org/keyword/179430-aftercreditsstinger/movie)).
- TMDB's API is free for non-commercial use with attribution, the TMDB logo and the notice "This product uses the TMDB API but is not endorsed or certified by TMDB" ([TMDB FAQ](https://developer.themoviedb.org/docs/faq)).
- RunPee's "Anything Extra" tells you about mid- and end-credits scenes without spoilers; it is free and donation-supported, 4.8 from 546 ratings ([App Store](https://apps.apple.com/app/id450326239)). MediaStinger was last updated in 2016 and rates 2.6 ([App Store](https://apps.apple.com/app/id646711029)). What's After The Credits marks stingers by colour and asterisk, with no API ([aftercredits.com](https://aftercredits.com/?p=12536)).

**Web platform**
- iOS and iPadOS 16.4+ support Web Push only for web apps added to the Home Screen with a manifest `display` of `standalone` or `fullscreen`. Permission must follow a tap. No Apple Developer account is needed ([WebKit](https://webkit.org/?p=13878)).
- Vercel Hobby is free for personal, non-commercial use, with 100 GB of fast data transfer a month ([Vercel](https://vercel.com/docs/plans/hobby)).
- GitHub Actions schedules run in UTC (an optional `timezone:` field arrived in March 2026), at most every 5 minutes, can be delayed at busy times, and are disabled after 60 days without activity in a public repo ([Cronuru](https://cronuru.com/guides/github-actions-scheduled-workflows)).

**History**
- Now Showing (2015) listed Lagos showtimes with Now, Next, Today and Tomorrow filters and offered an API ([Techpoint](https://techpoint.africa/general/now-showing-profile/)). Kolanuts.ng (2016) covered Lagos, Abuja and Port Harcourt with ratings, a watchlist and alerts ([TechMoran](https://techmoran.com/2017/04/20/kolanuts-ng-simplifying-cinema-experience-nigerians/)). Neither is around today. A listings product needs low running costs and a clear reason to come back.

## Competitors

### Hard competitors

| Product | What it does | Price | Strengths | Gaps |
| --- | --- | --- | --- | --- |
| [Lagocine](https://lagocine.com/) | Today's showtimes across 20 Lagos cinemas, area and kids filters, cinema and film pages, "Book it" links | Free, no ads seen, no commission | Broadest coverage; reads cinemas' own pages daily; labels old data, never guesses prices; no cookies; fast static site on Cloudflare | No "starting soon" or time-window view; no reminders or calendar; no credits info; no install or offline; no named operator or public contact beyond an email on the privacy page |
| [Showtimes NG](https://showtimes.ng/) | "Compare showtimes across Lagos cinemas": films, cinemas, IMDb, Metacritic and RT scores | Free | Ratings on film pages; links to booking with the showtime preselected ([docs](https://www.mintlify.com/parselfinger/showtimesng/quickstart)) | No area or time filters seen; ratings patchy; no freshness per time ("updated daily"); robots.txt says `ai-train=no, use=reference` |
| Chain sites: [Filmhouse](https://filmhouseng.com/), [Genesis](https://genesiscinemas.com/?p=79), EbonyLife, Silverbird (Veezi) | Each chain's own listings and booking | Free to browse | Source of truth; booking and seats | One chain at a time; different layouts; heavy pages; no cross-chain "what's on near me" |
| [Syticks](https://syticks.gitbook.io/merpi-by-syticks/api-reference/cinema-ticketing-cinema-movies-available-days-purchase-etc/get-list-of-cinema-movies) | Ticketing platform with a public cinema API (movies, showtimes, ticket types) | Ticket fees (not checked) | Structured data; a possible licensed source | Covers only cinemas that sell through it (not checked which) |
| [RunPee](https://apps.apple.com/app/id450326239) | Bathroom-break times and "Anything Extra" for credits scenes | Free, donations | Trusted, spoiler-free, 546 ratings at 4.8 | A separate app; no Lagos showtimes; likely thin on Nollywood (unverified) |

### Soft competitors

| Substitute | Why people use it | Where it fails |
| --- | --- | --- |
| Cinema Instagram pages | People already follow them; posters and trailers | Times are in images, not searchable; one cinema at a time; uses data on video |
| WhatsApp groups and status | Friends' recommendations; the plan happens there | No times; out of date by evening |
| Google search showtimes cards | Already in the search bar | Coverage for Lagos not checked; no freshness shown (unverified) |
| Calling the cinema or turning up | Certain | Slow; wasted trips in Lagos traffic |
| Ticketing apps (Nairabox and others) | Pay in one place | Only partner cinemas; ticket-first, not "what's on near me" (not checked in depth) |

**The opening.** Lagocine solved coverage and honesty. The gap is **time and place first**: "starting in the next 2 hours near Lekki", a countdown, a calendar reminder that actually fires, the credits answer on the same screen, and a page light enough for 3G. We should treat Lagocine as a possible partner and data source, not a rival (D-07).

## Brainstorm

**Ideas**
1. **Tonight near me** as the home view: showings that start soon, nearest area first.
2. **Starting in the next 2 hours** chip, with "Starts in 45 min" on each row.
3. **Film page**: every showing in Lagos for a film, sorted by start time, grouped by area.
4. **Cinema page**: today and tomorrow at one cinema, with its source and last-read time.
5. **Stay or Go chip** on film pages: "Stay: one scene after the credits", with source and how sure.
6. **Freshness line** on every showing: "Read from Filmhouse's site 2 hours ago".
7. **Reminder**: add-to-calendar (.ics) with a 30-minute alert, plus a live countdown on the page.
8. **Web Push reminder** for installed web apps (later).
9. **Travel buffer, honest version**: "You said 40 min to get there. Leave by 18:20." It uses the user's own number, never a traffic guess.
10. **Nollywood or Hollywood filter**, from film origin data.
11. **Kids filter** from cinema age ratings.
12. **Price where known**, "Price not listed" otherwise.
13. **Share a showing to WhatsApp** as a link with a rich preview card.
14. **Group plan**: "Who's in for 19:30?" link that friends tap to say yes (needs storage; later).
15. **Coming soon** calendar for Lagos release dates.
16. **Crowd confirmation** of credits scenes: "Confirmed by 12 viewers in Lagos" (needs storage; later).
17. **Data-saver mode**: no posters, text only.
18. **Install and offline**: the last loaded listings work without signal, clearly marked with their age.
19. **Format filter**: IMAX, 3D, 4DX, premium screens.

**Name options** (searched 6 Nov for app or site clashes in Lagos cinema; not a trademark or domain check)

| Name | Why | Risk |
| --- | --- | --- |
| **Wetin Dey Show** (recommended) | Pidgin for "what's showing". Sounds like Lagos; says the job in three words | Long for a URL; spelling varies ("wetin dey"); test with Lagos friends |
| Sinima | Short, local feel for "cinema" | Less clear to non-Nigerians; check meaning and use |
| Gidi Showtimes | Plain and searchable; "Gidi" is Lagos | Generic; close to Showtimes NG |
| Next Show | Says "starting soon" | Generic, likely taken elsewhere |
| Stay or Go | Memorable | Names one feature, not the product |

**Chosen direction**
1. **Time and place first.** Home is "Starting soon near you", with an area picker and an optional "Use my location".
2. **Honest showings.** Every time shows its source and age in words; a showing that has started is never bookable.
3. **Stay or Go on the film page**, from TMDB keywords with confidence words; "Not known yet" when we don't know.
4. **A reminder that works**: .ics calendar file and a live countdown. Push waits until after the week (D-11).
5. **Light and installable**: static pages, small JSON, data-saver by default on slow networks.

## How we'd build it

**Architecture (static, $0)**
- **Next.js 16 App Router, static export** (`output: "export"`), TypeScript, Tailwind 4. Same versions as Chime's portfolio.
- **Data is JSON in the repo.** `data/cinemas.json` (registry) and `data/showtimes.json` (schema v1, `docs/DATA.md`). Pages build from it.
- **Refresh by schedule.** A GitHub Actions workflow runs the fetchers, validates the JSON, commits it if it changed, and the host rebuilds. It stays disabled until each source is cleared (D-08).
- **Time-sensitive text is computed in the browser.** "Starts in 45 min", "Read 2 hours ago" and "Started" are worked out from `now` on the client, so an old static page never lies.
- **Hosting:** Vercel Hobby (non-commercial, fits a portfolio) or Cloudflare Pages. Pick on Day 0 (O-4).
- **No accounts, no server, no analytics** this week. Area choice and data-saver setting live in `localStorage`.

**Data pipeline**
1. Source registry (`data/sources.json`, Day 2) lists each source: owner, URL, method, permission status, robots result, rate limit.
2. One fetcher per source in `scripts/sources/`, each with a parser tested against saved fixtures in `tests/fixtures/`.
3. Normaliser: map to Cinema, Film, Showing; times to UTC; film titles matched to TMDB IDs.
4. Validator: schema check, no duplicate showings, no times in the past for "upcoming", per-source counts compared with the last run (a big drop marks the source "suspect", not empty).
5. Writer: `data/showtimes.json` plus `fetchedAt` per source.

**Privacy**
- Location is used once, in the browser, to pick the nearest area. It is never sent anywhere.
- No cookies, no trackers. Booking links go to the cinema's own site, and its rules apply there.
- TMDB is called only at build time, never from the user's phone.

### Product phases

Durations assume Claude Code on focused days.

| Phase | Goal | Scope | Done when | Duration |
| --- | --- | --- | --- | --- |
| 0 | Set up and ask | Repo, Next.js scaffold, CI, data-source audit, permission emails sent by Chime | Empty app deployed privately; audit table filled; emails sent | 1 day |
| 1 | MVP (the week) | Home "Starting soon", film, cinema and area pages, freshness, Stay or Go from TMDB, .ics, share link, PWA install, data-saver; data from fixtures and any cleared source | A Lagos user finds a showing in the next 2 hours near them in under 20 s on a mid-range Android on 3G; Lighthouse ≥ 90; repo public | 7 days |
| 2 | Live and returning | Scheduled refresh for every cleared source; Web Push for installed users; travel buffer; Coming soon; format filters | 7 days of clean daily refreshes; push reminder fires on iPhone and Android | 1–2 weeks |
| 3 | Social and community | Group plan link, crowd credits confirmations, Abuja and Port Harcourt | 50 confirmations collected; a group plan used by real friends | 2–3 weeks |

## Feature and deliverable checklist

**Product**
- [ ] Home: "Starting soon near you" with a 2-hour window and "Later tonight"
- [ ] Area picker with all Lagocine-listed areas; remembers the choice
- [ ] "Use my location" picks the nearest area (optional, on tap only)
- [ ] Film page: every showing in Lagos, by start time, grouped by area
- [ ] Cinema page: today and tomorrow, address, source and last read
- [ ] Area page: all cinemas and showings in an area
- [ ] Stay or Go chip with source and confidence words
- [ ] Add to calendar (.ics) with a 30-minute alert
- [ ] Live countdown on a chosen showing
- [ ] Share a showing to WhatsApp with a preview card
- [ ] Kids filter
- [ ] Nollywood or Hollywood filter (Should)
- [ ] Price shown when the source lists it, "Price not listed" otherwise

**Design**
- [ ] References collected by surface in `docs/design/REFERENCES.md`
- [ ] Three directions on a direction board; Chime picks one
- [ ] UI brief §1–3 filled; tokens in `src/styles/tokens.css`
- [ ] Copy for freshness, credits and started states reviewed with Chime
- [ ] Empty, stale and offline states designed
- [ ] App icon and manifest icons
- [ ] WhatsApp preview card design

**Engineering**
- [ ] Next.js static export scaffold with the portfolio's versions
- [ ] `docs/DATA.md` schema v1 as TypeScript types and a JSON validator
- [ ] Time helpers: UTC in, Africa/Lagos out, tested
- [ ] Freshness wording function, tested at every boundary
- [ ] Showing state (upcoming, starting, started, ended), tested
- [ ] Parser per cleared source, tested on saved fixtures
- [ ] TMDB matcher and credits lookup at build time, cached in the repo
- [ ] .ics generator, tested (RFC 5545 line folding, UTC times)
- [ ] Service worker: cache shell and last JSON; offline banner with age
- [ ] Web app manifest; install prompt on Android; Home Screen guide on iPhone
- [ ] Refresh workflow (disabled until cleared)

**Quality**
- [ ] Unit tests green in CI
- [ ] Playwright e2e for home, film, cinema, .ics download, filters
- [ ] Page weight budget enforced in CI (home ≤ 150 KB transferred)
- [ ] Lighthouse mobile ≥ 90 for performance and accessibility
- [ ] Keyboard, screen reader and 200% zoom pass
- [ ] Tested on Chime's iPhone and a mid-range Android on mobile data

**Launch and portfolio**
- [ ] Permission emails sent; replies logged in DECISIONS
- [ ] Attribution page: sources, TMDB notice and logo, takedown contact
- [ ] README with screenshots, architecture diagram and honest numbers
- [ ] Case study draft for chimexd.work
- [ ] Repo public (MIT) on Day 7; deployed on the free host
- [ ] 30-second screen recording of "find a film tonight"

## Data access and legal

This section shapes the whole build. The short version: **ask first, fetch politely only where allowed, always send people to the cinema to book.**

**1. Permission first.** On Day 0 Chime emails Lagocine and each chain (drafts in `docs/OUTREACH.md`). Lagocine already gathers 20 cinemas, says it sells nothing and takes no commission, and its robots.txt allows all crawling ([robots.txt](https://lagocine.com/robots.txt)). A data-sharing agreement with Lagocine would be the cleanest source. Its privacy page has a contact link; no operator is named ([Lagocine privacy](https://lagocine.com/privacy/)). Crawling being allowed is not a licence to republish, so we still ask.

**2. Fallback: a polite fetcher, per source, only when cleared.** For each source, record in `data/sources.json`: robots.txt result, terms of use (link and the relevant clause), permission status, and rate limit. Rules:
- Read robots.txt on every run and obey it.
- At most one request every 5 seconds per host, a few runs a day, at off-peak Lagos hours.
- A clear user agent with a contact URL (`LagosShowtimesBot/0.1 (+https://github.com/ChimeXXD/lagos-showtimes)`).
- Read only public listing pages. Never log in, never bypass a paywall, captcha or rate limit, never touch seat maps or checkout.
- Store only what we show: film, cinema, start time, format, booking link. No personal data.
- If a site's terms forbid automated access, or the owner asks us to stop, we stop that day.

**3. What we found on 6 Nov 2026**
- **Lagocine:** robots.txt allows all. No terms page found. Ask for permission (O-2).
- **Showtimes NG:** robots.txt sets `search=yes, ai-train=no, use=reference` and blocks named AI crawlers ([robots.txt](https://showtimes.ng/robots.txt)). Do not use its data.
- **Filmhouse:** robots.txt could not be read from our tools. Terms not found. Unknown.
- **Genesis, EbonyLife, Silverbird (Veezi):** terms not checked. Veezi's sessions page shows no terms in its content. Unknown.
- **Syticks:** documents a cinema API; auth and terms not stated. Ask.

**4. Law, plainly (not legal advice).** Nigeria's Cybercrimes Act 2015 lists hacking and unsolicited penetration testing as offences ([Legal 500](https://www.legal500.com/intelligence/nigeria/technology/an-overview-of-cybercrimes-and-internet-regulations-in-nigeria)); reading public pages within robots.txt is not that, but breaking a site's terms can still be a contract issue. The Nigeria Data Protection Act 2023 covers personal data; we collect none. Showtimes are facts, but a site's layout, images and descriptions are its work, so we never copy posters or synopses from cinema sites.

**5. Attribution.** Every showing names its source and links to it. An About page lists every source, the TMDB logo and notice, and how to ask us to change or remove data.

**6. TMDB terms.** Free for non-commercial use with attribution and logo ([TMDB FAQ](https://developer.themoviedb.org/docs/faq)). The full API terms page refused our fetcher (robots), so Chime reads it once on Day 0 and logs anything new (O-6). If the project ever earns money, TMDB needs a commercial licence.

**7. Takedown.** A plain "Ask us to remove this" link on the About page and in the README. On a request: disable the source in the registry, rebuild, reply within 48 hours, log it in DECISIONS.

## Insights and considerations

- **Lagocine is the benchmark, not the enemy.** Its honesty rules ("Old data is labeled, not hidden", unknown prices "never guessed") match ours. Our edge is the evening question and the credits answer.
- **Two earlier Lagos apps faded.** Keep running costs at zero and build a reason to come back (reminders, Stay or Go).
- **Freshness is a feature.** Most cinemas publish two or three days ahead; a time read this morning is safer than one read yesterday. Say which.
- **"No credits scene" is a claim.** A missing TMDB keyword means "not known", not "Go". Only say "Go" when a source says so.
- **Nollywood credits data will be thin.** TMDB tagging for Nollywood films is likely sparse (unverified). Show "Not known yet" and plan crowd confirmation for Phase 3.
- **Lagos traffic breaks any "leave by" promise.** Use the user's own travel estimate, or say nothing.
- **Push on iPhone needs install.** Most people won't add a site to the Home Screen; the .ics file works for everyone.
- **Data cost shapes design.** Text first, posters optional, no web fonts heavier than one family.
- **One time zone, but test it.** Lagos is UTC+1 all year. Visitors and CI runners are not, so display with `Africa/Lagos` explicitly.

## Success metrics

| Metric | Target this week | How measured |
| --- | --- | --- |
| Time to find a showing in the next 2 hours near you | Under 20 s | Playwright timing plus 3 people timed on their phones |
| Home page transferred size | ≤ 150 KB on first load | CI budget check, Lighthouse |
| Lighthouse mobile performance and accessibility | ≥ 90 each | Lighthouse CI run |
| Showings with a source and last-read time | 100% | Validator in CI |
| Started showings shown as bookable | 0 | Unit and e2e tests |
| Films with a Stay or Go answer (not "Not known yet") | Report the real share | Build log |
| Sources with written permission or cleared terms | Report the real count | `data/sources.json` |
| Permission replies | Logged by Day 7 | DECISIONS |

## Sources

Pages opened on 6 Nov 2026.

- Lagocine: [home](https://lagocine.com/), [how it gets its showtimes](https://lagocine.com/how-lagocine-gets-its-showtimes/), [cinemas](https://lagocine.com/cinemas/), [EbonyLife VI page](https://lagocine.com/cinema/ebonylife-vi/), [privacy](https://lagocine.com/privacy/), [robots.txt](https://lagocine.com/robots.txt), [sitemap](https://lagocine.com/sitemap.xml)
- Showtimes NG: [home](https://showtimes.ng/), [robots.txt](https://showtimes.ng/robots.txt), [docs overview](https://www.mintlify.com/parselfinger/showtimesng), [docs quickstart](https://www.mintlify.com/parselfinger/showtimesng/quickstart)
- [BusinessDay: 2025 box office ₦15.6bn](https://businessday.ng/news/article/nigerian-box-office-hit-historic-n15-6bn-in-2025-as-nollywood-films-get-more-views-than-hollywood-for-first-time/)
- [BusinessDay: H1 2026 ₦8.8bn](https://businessday.ng/life-arts/article/nigerian-box-office-revenue-reaches-n8-8bn-in-h1-2026/)
- [Nairametrics: box office eyes ₦20bn in 2026](https://nairametrics.com/2026/02/03/nigerian-box-office-eyes-n20-billion-revenue-in-2026-report/)
- [Nairametrics: top 10 most visited Lagos cinemas 2024](https://nairametrics.com/2025/02/01/top-10-most-visited-cinema-locations-in-lagos-2024/)
- [Vanguard: top 10 cinemas by 2025 revenue](https://www.vanguardngr.com/2026/02/top-10-largest-cinemas-in-nigeria-by-ticket-revenue)
- [TechCabal: cinemas in Nigeria](https://techcabal.com/2025/01/30/cinemas-in-nigeria/)
- [Intelpoint: Lagos licensed cinemas](https://intelpoint.co/insights/lagos-had-one-licensed-cinema-for-every-337000-people-in-2025)
- [Discover Lagos: best cinemas in Lagos](https://www.discoverlagos.ng/post/the-best-cinemas-in-lagos-where-movie-magic-comes-alive)
- [Legit.ng: IMAX Lekki](https://www.legit.ng/1260453-imax-lekki-ticket-bookings-contacts-address-opening-hours-ticket-prices-website.html)
- [Genesis Cinemas: about](https://genesiscinemas.com/?p=79) · [ThisDay: Genesis Lekki flagship](https://thisdaylive.com/index.php/2024/12/27/genesis-cinema-opens-lagos-flagship-in-lekki)
- [Filmhouse home](https://filmhouseng.com/) · [Silverbird Galleria on Veezi](https://ticketing.eu.veezi.com/sessions/?siteToken=4x3z2wcre0rek2beab5w344ae0)
- [Syticks cinema API docs](https://syticks.gitbook.io/merpi-by-syticks/api-reference/cinema-ticketing-cinema-movies-available-days-purchase-etc/get-list-of-cinema-movies)
- [Leadership: tariff hike and data use](https://leadership.ng/higher-tariff-forces-many-nigerians-to-reduce-data-usage)
- [WebKit: Web Push for web apps on iOS and iPadOS](https://webkit.org/?p=13878)
- [Raymond Camden: post- and mid-credit scenes via TMDB](https://www.raymondcamden.com/2026/03/28/checking-if-a-movie-has-a-post-or-mid-credit-scene) · [Kodi Stinger add-on](https://github.com/rmrector/service.stinger.notification) · [TMDB keyword 179430](https://www.themoviedb.org/keyword/179430-aftercreditsstinger/movie) · [TMDB developer FAQ](https://developer.themoviedb.org/docs/faq)
- [RunPee on the App Store](https://apps.apple.com/app/id450326239) · [MediaStinger on the App Store](https://apps.apple.com/app/id646711029) · [What's After The Credits](https://aftercredits.com/?p=12536)
- [Techpoint: Now Showing](https://techpoint.africa/general/now-showing-profile/) · [TechMoran: Kolanuts.ng](https://techmoran.com/2017/04/20/kolanuts-ng-simplifying-cinema-experience-nigerians/)
- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) · [Cronuru: GitHub Actions scheduled workflows](https://cronuru.com/guides/github-actions-scheduled-workflows)
- [Legal 500: cybercrimes and internet regulation in Nigeria](https://www.legal500.com/intelligence/nigeria/technology/an-overview-of-cybercrimes-and-internet-regulations-in-nigeria)

Could not open: TMDB's full API terms (robots disallowed), Filmhouse's robots.txt (error).
