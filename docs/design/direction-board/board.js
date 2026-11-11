// Direction board: renders the same three screens in each of three directions.
// Sentences follow docs/DATA.md (freshness, showing and credits wording). Mock data, clock at 18:45.

const DIRECTIONS = [
  {
    id: "a", name: "A · Rail",
    say: "A timeline. The start time sits in a rail on the left and each showing is a soft white card on a light grey page.",
    facts: [
      ["From your picks", "Luma's timeline, Meetup's calendar screen, Sweatpals' location menu."],
      ["Stay or Go", "A filled black capsule on its own line."],
      ["Type", "Figtree, a friendly rounded face. One font file to load (size not measured yet; the limit is 30 KB)."],
      ["Trade-off", "Calm and easy to scan, but cards take room: about 3 showings per screen."],
    ],
  },
  {
    id: "b", name: "B · Poster",
    say: "The film leads. Every row has a small poster, the type is rounder, and the area button and main actions are black capsules.",
    facts: [
      ["From your picks", "Hypelist's posters and black capsules, Peacock's font and buttons, Google TV's source tile, Apple TV."],
      ["Stay or Go", "The loudest: its own tile with the source under it."],
      ["Type", "Outfit, close to the Peacock face you liked. One font file to load (not measured yet; limit 30 KB)."],
      ["Trade-off", "The most like a film app, and the heaviest: posters come from TMDB and cost data on every row (not measured yet). Grey tiles stand in for them here."],
    ],
  },
  {
    id: "c", name: "C · Board",
    say: "A departures board. No cards and no pictures: the time is the biggest thing and thin lines do the rest.",
    facts: [
      ["From your picks", "Meetup's quiet day headings, Apple TV's one-line details, the grey \"2h ago\" lines from Yahoo Finance and Dropbox."],
      ["Stay or Go", "The quietest: a small outlined badge under the title."],
      ["Type", "The phone's own font. Nothing to load."],
      ["Trade-off", "The fastest and the plainest: about 4 showings per screen, but the least personality. Close to Tock, which you marked \"Not for us\"."],
    ],
  },
];

const FRESH_FH = "From Lagocine, which read Filmhouse's site 25 min ago";
const STALE_FH = "From Lagocine, which read Filmhouse's site yesterday at 15:06 · check with the cinema";
const SOON = [
  { id: 1, time: "19:00", count: "Starts in 15 min", soon: true, film: "Clayface", meta: "Filmhouse Lekki IMAX · IMAX", fresh: FRESH_FH, staleFresh: STALE_FH },
  { id: 2, time: "19:30", count: "Starts in 45 min", film: "The Secret Lives of Baba Segi's Wives", meta: "Grand Cinemas Lekki · 2D", fresh: "From Lagocine, which read Grand Cinemas' site 2 hours ago" },
  { id: 3, time: "20:10", count: "Starts in 1 h 25 min", film: "Street Fighter", meta: "Filmhouse Palms Mall Lekki · 3D", fresh: FRESH_FH, staleFresh: STALE_FH },
];
const LATER = [
  { id: 4, time: "21:40", count: "Starts in 2 h 55 min", film: "Whalefall", meta: "Filmhouse Lekki IMAX · 2D", fresh: FRESH_FH },
  { id: 5, time: "22:15", count: "Starts in 3 h 30 min", film: "Phoenix Fury", meta: "Grand Cinemas Lekki · 2D", fresh: "From Lagocine, which read Grand Cinemas' site 2 hours ago" },
];
const VENUES = [
  { area: "Lekki", sub: "your area", list: [
    { id: "fh-lekki", name: "Filmhouse Lekki IMAX", times: ["19:00", "21:40"], started: "18:40 · Started 5 min ago", fresh: FRESH_FH },
    { id: "grand", name: "Grand Cinemas Lekki", times: ["20:20", "22:30"], fresh: "From Lagocine, which read Grand Cinemas' site 2 hours ago" },
  ] },
  { area: "Ikeja", sub: "", list: [
    { id: "viva", name: "Viva Cinemas Ikeja", times: ["19:15", "21:50"], fresh: "From Lagocine, which read Viva Cinemas' site 2 hours ago" },
  ] },
];

const ICON = {
  filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
  share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
  warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16v.5"/></svg>',
};
// "Starts in 1 h 25 min" may only break after "Starts in".
const keep = (s) => s.replace(/^Starts in (.+)$/, (_, d) => `Starts in ${d.replace(/ /g, "&nbsp;")}`);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function row(r, stale) {
  const fresh = stale && r.staleFresh ? r.staleFresh : r.fresh;
  const isStale = stale && Boolean(r.staleFresh);
  return `<li class="row${r.soon ? " is-soon" : ""}" data-testid="showing.row.${r.id}">
    <div class="when"><time class="time" datetime="2026-11-11T${r.time}+01:00" data-testid="showing.time.${r.id}">${r.time}</time><span class="count" data-testid="showing.countdown.${r.id}">${keep(r.count)}</span></div>
    <div class="card">
      <div class="poster" aria-hidden="true" data-testid="showing.poster.${r.id}">${esc(r.film)}</div>
      <div class="what">
        <a class="title" href="#" data-testid="showing.film.${r.id}">${esc(r.film)}</a>
        <span class="meta" data-testid="showing.meta.${r.id}">${esc(r.meta)}</span>
        <span class="fresh${isStale ? " is-stale" : ""}" data-testid="showing.freshness.${r.id}">${esc(fresh)}</span>
      </div>
      <div class="act">
        <a class="book" href="#" data-testid="showing.book.${r.id}">Book</a>
        <button class="more" type="button" aria-label="Remind me or share ${esc(r.film)} at ${r.time}" data-testid="showing.more.${r.id}">${ICON.more}</button>
      </div>
    </div>
  </li>`;
}

const topBar = `<header class="top">
  <a class="wordmark" href="#" data-testid="wordmark" data-wordmark>Lagos Showtimes</a>
  <button class="pill is-area" type="button" data-testid="area.button">Lekki ▾</button>
  <button class="pill" type="button" aria-label="Filters" data-testid="filters.button">${ICON.filter}</button>
</header>`;
const section = (title, sub, key, rows, stale) => `<section>
  <div class="sec-head"><h3 class="sec-title" data-testid="section.${key}.title">${title}</h3><span class="sec-sub" data-testid="section.${key}.sub">${sub}</span></div>
  <ul class="rows">${rows.map((r) => row(r, stale)).join("")}</ul>
</section>`;
const foot = `<p class="foot" data-testid="footer.note">Times come from each cinema's own pages. Always book on the cinema's site.</p>`;

const home = () => `${topBar}<h2 class="page-title" data-testid="home.title">Starting soon in Lekki</h2>
  ${section("Starting soon", "next 2 hours", "soon", SOON, false)}${section("Later tonight", "until 04:00", "later", LATER, false)}${foot}`;

const stale = () => `${topBar}<h2 class="page-title" data-testid="home.title">Starting soon in Lekki</h2>
  <p class="banner" role="status" data-testid="banner.stale">${ICON.warn.replace("<svg", '<svg data-testid="banner.stale.icon"')}<span data-testid="banner.stale.text">Some times were read yesterday. Cinemas change programmes; check before you travel.</span></p>
  ${section("Starting soon", "next 2 hours", "soon", SOON, true)}${foot}`;

const venue = (v) => `<li class="venue" data-testid="film.venue.${v.id}">
  <a class="venue-name" href="#" data-testid="film.venue.${v.id}.name">${esc(v.name)}</a>
  <ul class="times">
    ${v.started ? `<li><span class="t is-started" data-testid="film.venue.${v.id}.started">${v.started}</span></li>` : ""}
    ${v.times.map((t) => `<li><a class="t" href="#" data-testid="film.venue.${v.id}.time.${t.replace(":", "")}"><time datetime="2026-11-11T${t}+01:00">${t}</time></a></li>`).join("")}
  </ul>
  <span class="fresh" data-testid="film.venue.${v.id}.freshness">${esc(v.fresh)}</span>
</li>`;

const film = () => `<header class="top">
    <a class="back" href="#" data-testid="film.back">‹ Lekki</a>
    <a class="wordmark" href="#" style="margin-right:0" data-testid="wordmark" data-wordmark>Lagos Showtimes</a>
  </header>
  <div class="hero">
    <div class="poster" aria-hidden="true" data-testid="film.poster">Clayface</div>
    <h2 class="film-title" data-testid="film.title">Clayface</h2>
    <p class="film-meta"><span data-testid="film.runtime">1 h 52 min</span><span class="badge" data-testid="film.format.imax">IMAX</span><span class="badge" data-testid="film.format.2d">2D</span></p>
    <div class="chip-box">
      <span class="chip" data-testid="credits.chip">Stay: scene after the credits · TMDB</span>
      <p class="chip-detail" data-testid="credits.detail"><span data-testid="credits.detail.text">TMDB lists an after-credits scene.</span> <a href="#" data-testid="credits.source">See it on TMDB</a></p>
    </div>
  </div>
  ${VENUES.map((a) => `<section>
    <div class="sec-head"><h3 class="sec-title" data-testid="film.area.${a.area.toLowerCase()}">${a.area}</h3><span class="sec-sub" data-testid="film.area.${a.area.toLowerCase()}.sub">${a.sub}</span></div>
    <ul class="venues">${a.list.map(venue).join("")}</ul>
  </section>`).join("")}
  <button class="share-film" type="button" data-testid="film.share">${ICON.share}Share this film</button>`;

const SCREENS = [["home", "Starting soon", home], ["home--stale", "The same list when the times are a day old", stale], ["film", "Film page with Stay or Go", film]];

document.getElementById("directions").innerHTML = DIRECTIONS.map((d) => `<section class="direction" aria-labelledby="dir-${d.id}">
  <div class="direction-head">
    <h2 class="direction-name" id="dir-${d.id}" data-testid="direction.${d.id}.name">${d.name}</h2>
    <p class="direction-say" data-testid="direction.${d.id}.say">${d.say}</p>
    <ul class="direction-facts">${d.facts.map(([k, v], i) => `<li data-testid="direction.${d.id}.fact.${i}"><b>${k}:</b> ${v}</li>`).join("")}</ul>
  </div>
  <div class="frames">${SCREENS.map(([key, caption, render]) => `<figure class="shot">
    <figcaption data-testid="direction.${d.id}.${key}.caption">${caption}</figcaption>
    <div class="frame dir-${d.id}" data-screen="${d.id}-${key}">${render()}</div>
  </figure>`).join("")}</div>
</section>`).join("");

// Board controls: light or dark, and the name shown in every header.
function press(group, button) {
  group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
}
document.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => {
  document.documentElement.dataset.theme = b.dataset.themeSet;
  press(b.parentElement, b);
}));
document.querySelectorAll("[data-name-set]").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("[data-wordmark]").forEach((w) => { w.textContent = b.dataset.nameSet; });
  press(b.parentElement, b);
}));
