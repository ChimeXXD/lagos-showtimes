// Sinima home redesign, draft 2 (cofounder.co as the style reference). Every screen is drawn from the real Lagos listing in data.js,
// with the clock at 13:45 on Wed 11 Nov 2026 (Lagos). Each section lists the picks it follows.
const { areas, cinemas, films } = window.SINIMA;
const NOW = 13 * 60 + 45;
const AREA = "lekki";
const REFS = "../docs/design/reference-board/images/r2-";

const mins = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const upcoming = (times) => times.filter((x) => mins(x.t) > NOW);
const startsIn = (t) => { const m = mins(t) - NOW, h = Math.floor(m / 60), r = m % 60; return h === 0 ? `Starts in ${m} min` : r === 0 ? `Starts in ${h} h` : `Starts in ${h} h ${r} min`; };
const runtime = (m) => (m ? `${Math.floor(m / 60)} h ${m % 60} min` : null);
const fmt = (f) => (!f || f === "2D" ? null : f.startsWith("IMAX") ? "IMAX" : f === "MX4D" ? "4D" : f);
const meta = (film) => [runtime(film.runtime), film.rating].filter(Boolean).join(" · ") || "Runtime not listed";

const I = {
  mark: '<svg viewBox="19 8 62 84" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M34 8H66A15 15 0 0 1 81 23A3.5 3.5 0 0 1 78.29,26.41A12 12 0 0 0 78.29,49.79A3.5 3.5 0 0 1 81 53.2V77A15 15 0 0 1 66 92H34A15 15 0 0 1 19 77A3.5 3.5 0 0 1 21.71,73.59A12 12 0 0 0 21.71,50.21A3.5 3.5 0 0 1 19 46.8V23A15 15 0 0 1 34 8ZM36.1 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0ZM46.6 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0ZM57.1 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z"/><g fill="#f5f5f2"><circle cx="39.5" cy="50" r="3.4"/><circle cx="50" cy="50" r="3.4"/><circle cx="60.5" cy="50" r="3.4"/></g></svg>',
  search: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  pin: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/></svg>',
  heart: (on) => `<svg class="heart${on ? " on" : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0 1 12 7.300 4.300 4.300 0 0 1 19.500 10c0 5.400-7.500 10-7.500 10z"/></svg>`,
  x: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  out: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16L17 7M9 7h8v8"/></svg>',
  bell: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.500 2h-15zM10 20h4"/></svg>',
  share: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
  link: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/></svg>',
  down: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M8 11l4 4 4-4M5 20h14"/></svg>',
  chat: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 1 3.500 6.600L4 20l1.200-3.800A8 8 0 0 1 4 12z"/></svg>',
  dots: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg>',
  back: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  caret: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>',
  map: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>',
  globe: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18"/></svg>',
  locate: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4L4 11l6.500 2.500L13 20z"/></svg>',
};
// A small pixel-art sky, drawn from the film's id: day, dusk or night, with clouds and a strip of land.
const SKIES = [
  { sky: ["#1f86e0", "#3d9bea", "#63b2f0"], cloud: ["#ffffff", "#d6ecfb"], land: ["#3f9a3a", "#2f7d32", "#57b148"] },
  { sky: ["#e9703f", "#f08f55", "#f6b27a"], cloud: ["#fde3c3", "#f9c79a"], land: ["#4a2f52", "#3a2443", "#5d3c63"] },
  { sky: ["#131c45", "#1c2a63", "#2a3d85"], cloud: ["#4b5fa8", "#3a4c92"], land: ["#0d1533", "#0a1028", "#16214a"] },
];
function pixelSky(seed, cols = 20, rows = 30) {
  let n = seed; const rnd = () => ((n = (n * 1664525 + 1013904223) >>> 0) / 4294967296);
  const p = SKIES[seed % 3], land = Math.round(rows * 0.2), r = [];
  const band = Math.ceil((rows - land) / 3);
  p.sky.forEach((c, i) => r.push(`<rect x="0" y="${i * band}" width="${cols}" height="${band + 1}" fill="${c}"/>`));
  for (let k = 0; k < 4; k++) {
    const w = 4 + Math.floor(rnd() * 6), x = Math.floor(rnd() * cols) - 2, y = Math.round(rows * 0.34) + Math.floor(rnd() * (rows * 0.66 - land - 5));
    r.push(`<rect x="${x + 1}" y="${y}" width="${w - 2}" height="1" fill="${p.cloud[0]}"/><rect x="${x}" y="${y + 1}" width="${w}" height="1" fill="${p.cloud[0]}"/><rect x="${x + 1}" y="${y + 2}" width="${w - 1}" height="1" fill="${p.cloud[1]}"/>`);
  }
  if (seed % 3 === 2) for (let k = 0; k < 14; k++) r.push(`<rect x="${Math.floor(rnd() * cols)}" y="${Math.floor(rnd() * (rows - land - 2))}" width="1" height="1" fill="#e8ecff" opacity="${0.4 + rnd() * 0.6}"/>`);
  r.push(`<rect x="0" y="${rows - land}" width="${cols}" height="${land}" fill="${p.land[0]}"/>`);
  for (let x = 0; x < cols; x++) { const h = Math.floor(rnd() * 3); if (h) r.push(`<rect x="${x}" y="${rows - land - h}" width="1" height="${h}" fill="${p.land[0]}"/>`); for (let y = rows - land; y < rows; y++) if (rnd() < 0.3) r.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${p.land[1 + Math.floor(rnd() * 2)]}"/>`); }
  return `<svg viewBox="0 0 ${cols} ${rows}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" aria-hidden="true">${r.join("")}</svg>`;
}
const hash = (s) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

// A real poster where TMDB has one; otherwise a designed title poster, never an empty box.
// Assumed for this draft: "Ramayana" is the same film as "Ramayana: Rise of a Legend".
const ART = { ramayana: "ramayana-rise-of-a-legend" };
function poster(film) {
  const art = film.poster ? film.id : ART[film.id];
  if (art) return `<img class="po" src="posters/${art}.jpg" alt="">`;
  return `<div class="tp" aria-hidden="true">${pixelSky(hash(film.id))}<b class="${film.title.length > 16 ? "long" : ""}">${esc(film.title)}</b><i>Now showing</i></div>`;
}

const filmsAt = (c) => Object.entries(c.films).map(([id, times]) => ({ film: films[id], times: upcoming(times) })).filter((x) => x.times.length).sort((a, b) => a.times[0].t.localeCompare(b.times[0].t));
const formatsAt = (c) => [...new Set(filmsAt(c).flatMap((x) => x.times.map((t) => fmt(t.f))).filter(Boolean))];
const timeChips = (times, max) => times.slice(0, max).map((x) => `<a class="t" href="#">${x.t}${fmt(x.f) ? `<small>${fmt(x.f)}</small>` : ""}</a>`).join("") + (times.length > max ? `<a class="t more" href="#">+${times.length - max}</a>` : "");
const viaLine = (c) => (c.online ? `From Lagocine, which read ${c.chain}'s site today at 00:05` : "Read from Lagocine today at 01:36");

function pageTop(active, phone) {
  const tabs = `<nav class="tabs" aria-label="Sections">${["Cinemas", "Films", "Starting soon"].map((t) => `<a class="tab${t === active ? " on" : ""}" href="#">${t}</a>`).join("")}</nav>`;
  const logo = `<a class="logo" href="#">${I.mark}Sinima</a>`;
  return phone
    ? `<header class="top">${logo}<a class="round" href="#" aria-label="Search">${I.search}</a></header>${tabs}`
    : `<header class="top">${logo}${tabs}<span class="search">${I.search}Search a film or cinema</span></header>`;
}
const areaChips = () => `<span class="chip on">${I.pin}Lekki</span><a class="chip" href="#">Victoria Island</a><a class="chip" href="#">Sangotedo</a><i class="sep"></i><a class="chip" href="#">All Lagos</a><a class="chip" href="#">More areas${I.caret}</a>`;

function cinemaCard(c, saved, n) {
  const list = filmsAt(c), formats = formatsAt(c);
  return `<article class="ccard">
    <div class="strip">${list.slice(0, 4).map((x) => poster(x.film)).join("")}
      ${formats.length ? `<span class="badge">${formats.join(" · ")}</span>` : ""}
      <button class="fav" type="button" aria-label="${saved ? "Remove from" : "Add to"} your cinemas">${I.heart(saved)}</button></div>
    <div class="tags">${formats.map((f) => `<span class="tag y">${f}</span>`).join("")}<span class="tag q${c.online ? "" : " off"}">${c.online ? "Book online" : "Tickets at the cinema"}</span></div>
    <div><h3 class="cname"><a href="#">${esc(c.name)}</a></h3>
    <p class="cmeta">${areas[c.area].name} · ${list.length} ${list.length === 1 ? "film" : "films"} still to start today</p></div>
    ${list.slice(0, n).map((x) => `<div class="svc"><div class="svc-top"><span>${esc(x.film.title)}</span><span>${startsIn(x.times[0].t).replace("Starts in", "in")}</span></div><small>${meta(x.film)}</small><div class="times">${timeChips(x.times, 4)}</div></div>`).join("")}
    ${list.length > n ? `<a class="more-link" href="#">View all ${list.length} films</a>` : ""}
    <p class="fresh">${viaLine(c)}</p>
  </article>`;
}
const byNext = (ids) => ids.map((id) => cinemas[id]).filter((c) => c && filmsAt(c).length).sort((a, b) => filmsAt(a)[0].times[0].t.localeCompare(filmsAt(b)[0].times[0].t));
const inArea = byNext(Object.keys(cinemas).filter((id) => cinemas[id].area === AREA));
const nextDoor = byNext(Object.keys(cinemas).filter((id) => areas[AREA].neighbours.includes(cinemas[id].area)));
const SAVED = ["filmhouse-lekki-imax", "ebonylife-vi"];
const savedRow = () => `<div class="saved">${SAVED.map((id, i) => { const c = cinemas[id], f = filmsAt(c)[0]; return `<a href="#"><span class="n">0.${i + 1}</span><span><b>${esc(c.name)}</b><span>${areas[c.area].name} · next ${f.times[0].t}</span></span>${I.heart(true)}</a>`; }).join("")}</div>`;

function home(phone) {
  return `${pageTop("Cinemas", phone)}<div class="wrap">
    <div class="head"><div><p class="eyebrow">Wed 11 Nov · Lagos · 13:45</p><h1 class="title">Cinemas near Lekki${phone ? " " : "<br>"}<span>and what they are showing today</span></h1><p class="sub">${inArea.length} cinemas in Lekki and ${nextDoor.length} next door, soonest first. Tap a time to see the showing and book on the cinema's own site.</p></div>
      ${phone ? "" : `<div class="chips"><span class="chip on">Any format</span><a class="chip" href="#">IMAX</a><a class="chip" href="#">4D</a></div>`}</div>
    <div class="filters"><div class="chips">${areaChips()}</div>${phone ? "" : `<div class="days"><span class="day on">Today</span><a class="day" href="#">Tomorrow</a></div>`}</div>
    ${phone ? `<div class="filters"><div class="days"><span class="day on">Today</span><a class="day" href="#">Tomorrow</a></div><div class="chips"><span class="chip on">Any format</span><a class="chip" href="#">IMAX</a></div></div>` : ""}
    <div class="label"><p class="eyebrow">0.0 — Saved</p><h2>Your cinemas <span>${phone ? "" : "tap the heart on a cinema to keep it here"}</span></h2></div>${savedRow()}
    <div class="label"><p class="eyebrow">1.0 — Your area</p><h2>In Lekki <span>soonest first</span></h2></div>
    <div class="cgrid">${inArea.slice(0, phone ? 2 : 6).map((c) => cinemaCard(c, SAVED.includes(c.id), phone ? 1 : 2)).join("")}</div>
    <div class="label"><p class="eyebrow">2.0 — Next door</p><h2>Next to Lekki <span>Victoria Island and Sangotedo</span></h2></div>
    <div class="cgrid">${nextDoor.slice(0, phone ? 1 : 3).map((c) => cinemaCard(c, SAVED.includes(c.id), 1)).join("")}</div>
  </div>`;
}

const CIN = cinemas["genesis-purple-lekki"];
function posterCard(x) {
  const soon = mins(x.times[0].t) - NOW <= 60, f = [...new Set(x.times.map((t) => fmt(t.f)).filter(Boolean))];
  return `<article class="pcard"><a class="pwrap" href="#">${poster(x.film)}${f.length ? `<span class="badge">${f.join(" · ")}</span>` : ""}${soon ? `<span class="soon">${startsIn(x.times[0].t)}</span>` : ""}</a>
    <h3 class="ptitle"><a href="#">${esc(x.film.title)}</a></h3><p class="pmeta">${meta(x.film)}</p><div class="times">${timeChips(x.times, 3)}</div></article>`;
}
function cinemaPage(phone) {
  const list = filmsAt(CIN);
  return `${pageTop("Cinemas", phone)}<div class="wrap">
    <a class="crumb" href="#">${I.back}Cinemas near Lekki</a>
    <div class="hero"><div><div class="tags"><span class="tag q">Book online</span><span class="tag">Lekki</span></div>
      <h1 class="title">${esc(CIN.name)}</h1><p class="sub">${esc(CIN.address ?? "Lekki, Lagos")}</p>
      <div class="actions"><a class="btn" href="#">${I.map}Open in maps</a><a class="btn" href="#">${I.globe}Cinema website</a><button class="btn" type="button">${I.heart(false)}Save</button></div></div>
      <div class="note"><b>Where these times come from</b>${viaLine(CIN)}. Genesis doesn't say the format of its showings, so none is shown.</div></div>
    <div class="filters"><div class="daytiles"><div class="dtile on"><b>Today</b><span>Wed 11 November</span></div><a class="dtile" href="#"><b>Tomorrow</b><span>Thu 12 November</span></a></div>
      ${phone ? "" : `<p class="sub">${list.length} films still to start today</p>`}</div>
    <div class="label"><p class="eyebrow">Programme — Wed 11 Nov</p><h2>Showing today <span>${list.length} films, soonest first</span></h2></div>
    <div class="pgrid">${list.map(posterCard).join("")}</div>
  </div>`;
}

const RAMA = films.ramayana;
function venue(id) {
  const c = cinemas[id], times = upcoming(c.films.ramayana).filter((x) => fmt(x.f) === "IMAX");
  return `<article class="venue"><div class="venue-top"><div><div class="tags"><span class="tag y">IMAX</span><span class="tag q">Book online</span></div><h3 class="cname" style="margin-top:6px"><a href="#">${esc(c.name)}</a></h3><p class="cmeta">${areas[c.area].name}</p></div>${I.heart(SAVED.includes(id))}</div>
    <div class="slots">${times.map((x) => `<a class="slot" href="#"><span><b>${x.t}</b><span>${x.f}</span></span><span class="go">${startsIn(x.t)}</span></a>`).join("")}</div>
    <p class="fresh" style="margin-top:12px">${viaLine(c)}</p></article>`;
}
function filmPage(phone) {
  return `${pageTop("Films", phone)}<div class="wrap"><a class="crumb" href="#">${I.back}Films in Lagos</a>
    <div class="film"><div><div class="fposter"><div>${poster(RAMA)}</div><div><h1 class="title" style="font-size:${phone ? 28 : 34}px">Ramayana</h1><p class="sub">Showing in IMAX, 4D and 2D</p></div></div>
      <div class="stay"><b>Credits scene: not known yet</b><span>No source has told us yet.</span></div></div>
      <div><div class="frow"><span>Format</span><a class="chip" href="#">All</a><span class="chip on">IMAX</span><a class="chip" href="#">4D</a><a class="chip" href="#">2D</a></div>
        <div class="frow"><span>Area</span><span class="chip on">${I.pin}Lekki</span><a class="chip" href="#">Victoria Island</a><a class="chip" href="#">All Lagos</a></div>
        <div class="frow"><span>Day</span><span class="chip on">Today</span><a class="chip" href="#">Tomorrow</a></div>
        <div class="label" style="margin-top:28px"><p class="eyebrow">Matches</p><h2>In IMAX near Lekki <span>2 cinemas</span></h2></div>
        ${venue("filmhouse-lekki-imax")}${venue("filmhouse-circle-mall")}
        <p class="left-out">3 more cinemas in Lekki show Ramayana in 2D or don't say the format. <a href="#" style="text-decoration:underline;color:var(--text);font-weight:600">Show all formats</a></p></div></div>
  </div>`;
}

const CLAY = films.clayface;
const ticket = () => `<div class="ticket"><div>${poster(CLAY)}</div><div><h3>Clayface</h3><p>${esc(CIN.name)}</p><span class="big">22:25</span><p>Today, Wed 11 Nov</p></div></div>`;
const showingBody = () => `${ticket()}<div class="count">Starts in 8 h 40 min</div>
  <div class="facts"><div class="fact"><span>Runs</span><b>${runtime(CLAY.runtime)} · out about 00:14</b></div><div class="fact"><span>Rating</span><b>${CLAY.rating}</b></div><div class="fact"><span>Format</span><b>Not listed by Genesis</b></div><div class="fact"><span>Where</span><b>Lekki</b></div></div>
  <div class="stay" style="margin:0"><b>Credits scene: not known yet</b><span>No source has told us yet.</span></div><p class="fresh">${viaLine(CIN)}</p>`;
const showingFoot = () => `<a class="btn primary big" href="#">Book on Genesis's site${I.out}</a><div class="pair"><button class="btn" type="button">${I.bell}Remind me</button><button class="btn" type="button">${I.share}Share</button></div>`;
const showingDesk = () => `<div class="dim">${cinemaPage(false)}</div><aside class="panel"><div class="panel-head"><b>This showing</b><button class="round" type="button" aria-label="Close">${I.x}</button></div><div class="panel-body">${showingBody()}</div><div class="panel-foot">${showingFoot()}</div></aside>`;
const showingPhone = () => `<div class="dim">${cinemaPage(true)}</div><section class="sheet"><i class="grab"></i>${ticket()}<div class="count">Starts in 8 h 40 min</div><p class="fresh">${viaLine(CIN)}</p>${showingFoot()}</section>`;

const shareInner = (copied) => `<button class="round x" type="button" aria-label="Close">${I.x}</button><h3>Films are better <span>with friends</span></h3><p>Send this showing so your people know what you're watching.</p>
  <div class="scard"><div class="sky">${pixelSky(2, 50, 17)}</div><div class="in"><small>Tonight · 22:25</small><b>Clayface</b><span>${esc(CIN.name)}</span><span>Lekki, Lagos</span><em>${I.mark}sinima-app.vercel.app</em></div></div>
  <div class="minis"><span class="mini"><i>${I.down}</i>Save image</span><span class="mini"><i>${I.chat}</i>WhatsApp</span><span class="mini"><i>${I.dots}</i>More</span></div>
  <div class="pair"><button class="btn primary" type="button" >${I.share}Share</button><button class="btn" type="button"  data-copy>${copied ? "Link copied" : `${I.link}Copy link`}</button></div>`;
const sharePhone = (copied) => `<div class="dim">${cinemaPage(true)}</div><section class="sheet share">${shareInner(copied)}</section>`;
const shareDesk = () => `<div class="dim">${cinemaPage(false)}</div><section class="modal share">${shareInner(false)}</section>`;
const areaMenu = () => `<div style="padding:24px"><span class="chip on" style="margin-bottom:8px">More areas${I.caret}</span><div class="menu"><a href="#">${I.locate}Use my location</a><hr>${Object.entries(areas).map(([slug, a]) => `<a class="${slug === AREA ? "on" : ""}" href="#">${a.name}<span>${Object.values(cinemas).filter((c) => c.area === slug).length} cinemas</span></a>`).slice(0, 8).join("")}</div></div>`;

const P = (id, app, took) => [id, app, took];
const SCREENS = [
  { id: "home", title: "1 · Cinemas (home)", say: "You open Sinima and see the cinemas near you, soonest first. Your area is in the heading and in the chips under it; there is no dropdown to open. Each card shows what is on and the next times, so a time is one tap away.",
    frames: [["Desktop", "desk", () => home(false)], ["Phone", "phone", () => home(true)], ["More areas, open", "state", areaMenu]],
    picks: [P("fresha-venues", "Fresha", "The card: picture on top with a badge and a heart, name, one quiet line, then blocks with filled time chips and “View all”. Day tabs with an underline."), P("subway-nearby", "Subway", "Small tags above a large bold name, heart at the right, on a warm page."), P("livenation-venues", "Live Nation", "“Your cinemas”: a short list with a small picture, name, place and a heart."), P("meetup-near", "Meetup", "The place inside the heading, filters on the same line at the right, cards in a grid."), P("posh-grid", "Posh", "The heading reads as a sentence about where; poster-led cards several per row."), P("applemusic-concerts", "Apple Music", "Filled chips for what is chosen: place, day, format."), P("careem-home", "Careem", "Phone header: place and search at the top, a row of chips under it."), P("sweatpals-location", "Sweatpals", "“More areas” opens a short menu with “Use my location” first.")] },
  { id: "cinema", title: "2 · A cinema's page", say: "The cinema's films as poster cards, five across on a desktop and two on a phone. Three of these seven films have no poster on TMDB, so each gets a small pixel-art sky with its title on it, in the spirit of the reference site: never an empty box.",
    frames: [["Desktop", "desk", () => cinemaPage(false)], ["Phone", "phone", () => cinemaPage(true)]],
    picks: [P("hbomax", "HBO Max", "Tall posters in an even row, a small label on the poster, chips above."), P("disney", "Disney+", "Five per row under one title."), P("airbnb-grid", "Airbnb", "Card: rounded picture, bold title, quiet lines under it."), P("hypelist-movies", "Hypelist", "On a phone: large rounded posters, two per row."), P("fresha-day", "Fresha", "Two large tiles: “Today, Wed 11 November” and “Tomorrow, Thu 12 November”.")] },
  { id: "film", title: "3 · A film, by format and area", say: "“Where is Ramayana showing in IMAX near Lekki?” Format, area and day are chips; only the cinemas that match stay, and the page says what it left out.",
    frames: [["Desktop", "desk", () => filmPage(false)], ["Phone", "phone", () => filmPage(true)]],
    picks: [P("airbnb-time", "Airbnb", "Each time is a full-width card: the time large, a quiet line under it, detail at the right."), P("applemusic-concerts", "Apple Music", "Filled chips for the chosen format, area and day."), P("subway-nearby", "Subway", "Tags above the bold cinema name, heart at the right.")] },
  { id: "showing", title: "4 · One showing, before you book", say: "Tapping a time opens this. On a desktop it is a panel on the right with the page still visible behind it; on a phone it is a sheet. Book names the site it opens.",
    frames: [["Desktop", "desk fixed", showingDesk], ["Phone", "phone fixed", showingPhone]],
    picks: [P("time2book-panel", "Time2book", "Desktop: a right-hand panel over the dimmed page; a soft coloured card at the top; facts in two columns."), P("etsy-panel", "Etsy", "The poster in the panel, and one dark button at the bottom. You wrote: “I like the idea of the poster”."), P("x-space", "X", "Phone: a coloured card with the title and time, then full-width buttons."), P("joi-event", "Joi", "The countdown as its own wide capsule."), P("clubhouse-event", "Clubhouse", "“Remind me” and “Share” as a pair."), P("dice-ticket", "DICE", "The card shaped like a ticket, with notches in its sides.")] },
  { id: "share", title: "5 · Share", say: "Your Fixtured pick, restyled. The sheet slides up, the card pops in at a tilt, and “Copy link” changes to “Link copied”. Press Replay to see it move; tap Copy link to see the change.",
    frames: [["Phone", "phone fixed play", () => sharePhone(false)], ["Phone, link copied", "phone fixed", () => sharePhone(true)], ["Desktop", "desk fixed", shareDesk]],
    picks: [P("fixtured-share", "Fixtured", "The whole pattern: heavy headline, one line, a tilted card with day, time and names, then “Share” dark and “Copy link” light."), P("polarsteps-share", "Polarsteps", "A row of three small buttons between the card and the two main buttons.")] },
];

document.getElementById("screens").innerHTML = SCREENS.map((s, n) => `<section class="screen" id="${s.id}"><p class="eyebrow">${n + 1}.0 — Screen</p><h2>${s.title.replace(/^\d · /, "")}</h2><p>${s.say}</p>
  <div class="frames">${s.frames.map(([cap, cls, render]) => `<figure class="shot"><figcaption>${cap} · <button type="button" data-replay>Replay</button></figcaption><div class="frame ${cls === "state" ? "" : cls.replace(" play", "")}" ${cls === "state" ? 'style="width:360px"' : ""}>${render()}</div></figure>`).join("")}</div>
  <p class="picks-title">Layout from your picks</p><div class="picks">${s.picks.map(([id, app, took]) => `<div class="pick"><img src="${REFS}${id}.webp" alt="" loading="lazy"><span><b>${app}</b>${took}</span></div>`).join("")}</div></section>`).join("");

// Entrance motion: each frame plays once when it scrolls into view, its parts staggered in order.
const STAGGER = ".head, .filters, .label, .saved a, .ccard, .pcard, .venue, .hero, .film > div:first-child, .frow, .sheet > *, .panel-body > *, .modal > *";
document.querySelectorAll(".frame").forEach((f) => f.querySelectorAll(STAGGER).forEach((el, i) => el.style.setProperty("--i", Math.min(i, 14))));
const seen = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("play"); seen.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll(".frame").forEach((f) => seen.observe(f));

// Controls: font, theme, desktop frame size. The chosen font goes into the "copy my pick" line.
const root = document.documentElement;
function press(button) { button.parentElement.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === button))); }
document.querySelectorAll("[data-font]").forEach((b) => b.addEventListener("click", () => { root.style.setProperty("--font", `"${b.dataset.font}", system-ui, sans-serif`); press(b); }));
document.getElementById("replayall").addEventListener("click", () => document.querySelectorAll(".frame").forEach((f) => { f.classList.remove("play"); void f.offsetWidth; f.classList.add("play"); }));
document.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => { document.body.classList.toggle("fit", b.dataset.size === "fit"); press(b); }));
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-replay]")) { const f = e.target.closest(".shot").querySelector(".frame"); f.classList.remove("play"); void f.offsetWidth; f.classList.add("play"); }
  const copy = e.target.closest("[data-copy]");
  if (copy) { copy.textContent = "Link copied"; setTimeout(() => { copy.innerHTML = `${I.link}Copy link`; }, 2000); }
  if (e.target.closest(".frame a")) e.preventDefault();
});
document.getElementById("pickbtn").addEventListener("click", async () => {
  const font = document.querySelector('[data-font][aria-pressed="true"]').dataset.font;
  const text = `Home redesign draft 2 (cofounder.co style): font = ${font}. Changes I want: `;
  try { await navigator.clipboard.writeText(text); document.getElementById("picked").textContent = `Copied: "${text}" Paste it to Claude and add your changes.`; }
  catch { document.getElementById("picked").textContent = `Tell Claude: "${text}"`; }
});
