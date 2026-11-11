# UI brief

How each page looks and behaves. **Draft, 6 Nov 2026.** §4–7 (screens, copy, states, test IDs) are ready to build from. §1–3 (direction, tokens, motion) are filled in on Day 1, after Chime picks a direction from `direction-board/` (D-13). Copy marked *new* can change at screen review. All freshness, showing and credits sentences come from `docs/DATA.md`; don't reword them here.

## 1. Direction (Day 1)

To be written from Chime's pick. Constraints any direction must meet:

1. **Time is the hero.** The start time is the biggest thing on a row; the film title second.
2. **Honesty is visible but quiet.** The freshness line sits under each row in a smaller, calm style. Never a coloured dot alone.
3. **Fast on 3G.** System font stack or one variable font ≤ 30 KB; no hero images; posters optional and small.
4. **One hand, outdoors.** Big targets, high contrast in sunlight, dark mode for the cinema itself.
5. **Lagos voice, not slang overload.** Plain English with a little local warmth in headings and empty states.

Questions for the direction board: list vs timeline look for "Starting soon"; how loud the Stay or Go chip is; whether the name's wordmark leans playful (Wetin Dey Show) or clean (Sinima); light-first or dark-first.

## 2. Tokens (`src/styles/tokens.css`, Day 1)

- Colour roles: `bg`, `surface`, `text`, `text-muted`, `accent`, `book` (action), `stale` (paired with words), `focus`. Light and dark. AA contrast for all text; AAA for times.
- Type: one family; sizes for time (large, tabular figures), title, body, meta.
- Spacing 4 · 8 · 12 · 16 · 24 · 32. Radius: chip capsule, card 12.
- Motion: countdown ticks without animation; row entry fades only when `prefers-reduced-motion` is not set.

## 3. Motion (Day 1)

- No motion needed to understand anything. Optional: chip appear, banner slide. Reduced motion: none.

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
