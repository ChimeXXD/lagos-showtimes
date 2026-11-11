# UI brief

How each page looks and behaves. **Draft, 6 Nov 2026; §1–3 written 11 Nov 2026** from Chime's pick of direction B (D-35), palette (D-34) and the name Sinima (D-36). §4–7 (screens, copy, states, test IDs) are ready to build from. Copy marked *new* can change at screen review. All freshness, showing and credits sentences come from `docs/DATA.md`; don't reword them here.

## 1. Direction: B · Poster (D-35)

Chime picked this on 11 Nov 2026 from three directions. The reference is the three `b-…` frames on `direction-board/index.html` (Starting soon, the stale state, the film page). Where this brief and those frames disagree, the frames win until the real screen exists; after that the site wins (D-13).

**In one line:** the film leads. Black and white, a small poster on every showing, round type, capsule buttons, and one colour on screen: the blue Book button.

What makes it B:

1. **The time is still the biggest thing on a row** (26 px, weight 600, tabular figures), with the countdown beside it in a small grey capsule. The film title comes second (17 px).
2. **A small poster on every showing row** (76 × 114, corners 12). With no poster, or before it loads, a dark tile with the film's title stands in. Rows must read correctly with every poster missing.
3. **Capsules.** Book, the area button, time chips and the countdown are full capsules. The area button and "Share this film" are black capsules; Book is the only blue thing.
4. **Stay or Go is a tile, not a badge:** the answer in 16 px on a grey tile, with the detail line and source link under it. The loudest of the three directions, on purpose.
5. **Freshness stays quiet:** 12 px grey under the cinema line, always in words. Stale wording turns the stale colour; the words carry it, the colour only backs them up.
6. **Light first.** Dark mode follows the phone's setting and uses the same roles.

Constraints that still hold (unchanged from the draft): time is the hero; honesty is visible but quiet; fast on 3G; one hand, outdoors; Lagos voice without slang overload.

Not settled yet:
- **Where poster images come from and what they cost** (Day 2, with the TMDB work). Never from cinema sites (rule 6). If they cannot fit the page budget (D-28) and TMDB's terms (D-31), posters stay on the film page only and rows use the title tile.
- **Illustrations and the app icon** (O-13): references first, then the empty state.

## 2. Tokens (`src/styles/tokens.css`)

Live in code; this table is a copy for reading. `tests/unit/tokens.test.ts` checks the contrast on every run, and `tests/e2e/theme.spec.ts` checks what the browser renders.

| Role | Light | Dark | Used for |
| --- | --- | --- | --- |
| `bg` | `#ffffff` | `#0a0a0a` | The page |
| `surface` | `#f3f3f3` | `#1a1a1a` | Tiles, banners, the countdown capsule |
| `text` | `#0a0a0a` | `#fafafa` | Times, titles, body. 18:1 or more on `bg` |
| `text-muted` | `#555555` | `#ababab` | Cinema line, freshness line |
| `accent` | `#0a0a0a` | `#fafafa` | Black capsules (area button, share) |
| `accent-text` | `#ffffff` | `#0a0a0a` | Text on `accent` |
| `book` | `#2f5fb3` | `#8fb4f5` | The Book button only (D-34) |
| `book-text` | `#ffffff` | `#06142e` | Text on `book` |
| `stale` | `#8a4b00` | `#f2c14e` | Old data, always with words |
| `focus` | `#0b57d0` | `#9cc2ff` | The 2 px focus ring |
| `line` | `#e2e2e2` | `#2c2c2c` | Hairlines and capsule outlines (not text) |
| `poster` | `#1f1f1f` | `#1f1f1f` | The tile behind a poster |

- **Type:** Outfit, then the phone's own font. One file, `public/fonts/outfit-sinima.woff2`: 25.5 KB, weights 400 to 600, Latin letters and accents, loaded with `font-display: swap` so it never blocks the page. Sizes: page 28, section 20, time 26, title 17, body 15, meta 13, freshness 12. Weight 600 for times, titles and buttons; 400 for the rest. Outfit has no naira sign: "₦" falls back to the phone's font.
- **Spacing:** 4 · 8 · 12 · 16 · 24 · 32.
- **Radius:** capsule 999 (buttons, chips), poster 12, tile and card 16, sheet 20.
- **Targets:** every link and button at least 44 × 44.
- Tailwind's own colour classes (`text-red-500`, `bg-white`) are switched off; `npm run lint` fails if one is written, or a named colour, or a hex value outside `tokens.css`.

## 3. Motion

- Nothing needs motion to be understood.
- Press feedback on buttons: 120 ms, `cubic-bezier(0.2, 0, 0, 1)` (`--motion-fast`, `--motion-ease`).
- The countdown changes its text without animation.
- Optional later: banner slide-in, chip appear. With `prefers-reduced-motion`: none of it.

## 4. Pages

### 4.1 Home `/` and area page `/area/[slug]` — Starting soon near you

Revised 11 Nov (D-18, D-22): the area page is this screen for one area; `/` is the same screen for all of Lagos and sends a returning visitor to their area. Below the showings sits a **"Now showing"** film list with a filter box (`films.filter`, `films.item.<slug>`). When nothing starts in 2 hours, the empty state also lists neighbouring areas with counts (`empty.neighbour.<slug>`): "Nearest: Surulere · 3 starting soon" *(new)*.

- **Header:** wordmark; area button "Lekki ▾" (`area.button`); filter button (`filters.button`).
- **Sections:** "Starting soon" (next 2 hours), "Later tonight" (until 04:00), "Tomorrow". Each a list of showing rows.
- **Showing row** (`showing.row.<id>`): start time "19:30", countdown "Starts in 45 min" (`showing.countdown`); film title; cinema · format ("Filmhouse Lekki · IMAX"); freshness line (`showing.freshness`); **Book** (`showing.book`) or "Tickets at the cinema"; overflow: Remind me (`showing.remind`), Share (`showing.share`).
- **Empty state** (no showings in 2 h): "Nothing starts in the next 2 hours in Lekki. Here's later tonight." *(new)*. No area chosen: area picker opens first.
- **Banners** (`banner.sample`, `banner.stale`, `banner.offline`): wording from DATA.md.

### 4.2 Area picker (sheet)
- List of areas with cinema counts ("Lekki · 7 cinemas"). "Use my location" at top (`area.locate`), Should.
- Denied: "No problem. Pick your area." *(new)*
- Test IDs: `area.option.<slug>`.

### 4.3 Film page `/film/[slug]`
- Title, runtime and rating when known. **Stay or Go chip** (`credits.chip`) with a detail line (`credits.detail`) and source links.
- Showings grouped by area, sorted by time; your area first.
- Share film (`film.share`).

### 4.4 Cinema page `/cinema/[id]`
- Name, area, address (only if known), "Cinema website" link, source line: "Times read from Filmhouse's site today at 09:10" (`cinema.source`).
- Today and Tomorrow tabs (`cinema.day.today`, `cinema.day.tomorrow`).

### 4.5 Area page `/area/[slug]`
- Same screen as 4.1 for one area (D-18), followed by the area's cinemas as links.

### 4.6 About `/about`
- What this is, how times are collected, a table of sources with status and last read (`about.sources`), TMDB logo and the exact notice, "Ask us to remove something" (`about.takedown`), privacy in five lines.

## 5. Copy

| Where | Copy |
| --- | --- |
| Home title | "Starting soon near you" *(new)* |
| Later section | "Later tonight" |
| No booking page | "Tickets at the cinema" |
| Remind me done | "Added. Your calendar will remind you 30 min before." *(new; shown after download)* |
| Share text | "Sinners · Filmhouse Lekki · Fri 19:30 — <url>" |
| Location denied | "No problem. Pick your area." |
| Footer | "Times come from each cinema's own pages. Always book on the cinema's site." *(new)* |

## 6. States

| State | What shows |
| --- | --- |
| Loading | Never a spinner for the main list: static HTML has absolute times; relative words fill in on hydrate |
| Sample data | Banner on every page; Book buttons read "Sample only" |
| Stale source | Banner + stale wording on its rows |
| Source failing | Banner naming the source and the age of its rows |
| Offline | Banner with saved data age; Book still opens (browser handles offline) |
| Started | "Started 5 min ago", no Book |
| No credits info | "Credits scene: not known yet" |

## 7. Accessibility checklist

- Rows are `<li>` with a visually hidden full sentence (SPEC §7).
- Times in `<time datetime="…Z">`.
- Focus ring from `focus` token, 2 px, visible on every control.
- Targets ≥ 44 px. Works at 320 px wide and 200% zoom.
- Countdown updates are not announced every 30 s (`aria-live` off); "Starting now" is announced once.
