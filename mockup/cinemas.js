// The Cinemas tab, redesign 1 (D-55), after Chime's picks: Instacart's store list (phone) and its
// grouped store cards (web). Real cinemas and times from data.js, clock at 13:45 on Wed 11 Nov 2026.
// Logos are the chains' own, kept local in mockup/logos/ (git-ignored) until Chime decides.
const { areas, cinemas, films } = window.SINIMA;
const NOW = 13 * 60 + 45;
const ONLY = window.ONLY || null; // "desk" or "phone": one kind of frame, for the design check

const mins = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const fmt = (f) => (!f || f === "2D" ? null : f.startsWith("IMAX") ? "IMAX" : f === "MX4D" ? "4D" : f);

const I = {
  mark: '<svg viewBox="19 8 62 84" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M34 8H66A15 15 0 0 1 81 23A3.5 3.5 0 0 1 78.29,26.41A12 12 0 0 0 78.29,49.79A3.5 3.5 0 0 1 81 53.2V77A15 15 0 0 1 66 92H34A15 15 0 0 1 19 77A3.5 3.5 0 0 1 21.71,73.59A12 12 0 0 0 21.71,50.21A3.5 3.5 0 0 1 19 46.8V23A15 15 0 0 1 34 8ZM36.1 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0ZM46.6 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0ZM57.1 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z"/><g fill="#5fd4c8"><circle cx="39.5" cy="50" r="3.4"/><circle cx="50" cy="50" r="3.4"/><circle cx="60.5" cy="50" r="3.4"/></g></svg>',
  search: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  pin: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/></svg>',
  caret: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>',
  play: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8L10.4 6z"/></svg>',
  heart: (on) => `<svg class="heart${on ? " on" : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0 1 12 7.300 4.300 4.300 0 0 1 19.500 10c0 5.400-7.500 10-7.500 10z"/></svg>`,
};

// Each chain's logo, trimmed to its visible marks (mockup/logos/tiles/, made by trim.py) so the tile
// centres it exactly, on the tile colour it reads best on (checked on white and on near-black).
const BRAND = {
  Filmhouse: ["filmhouse", "dark"], Genesis: ["genesis", "light"], EbonyLife: ["ebonylife", "dark"], Silverbird: ["silverbird", "light"],
  "Blue Pictures": ["bluepictures", "light"], Filmworld: ["filmworld", "light"], Grand: ["grand", "dark"], Ozone: ["ozone", "ozone"],
  Sky: ["sky", "dark"], THC: ["thc", "dark"], Viva: ["viva", "dark"], Magnificent: ["magnificent", "light"],
};
const logo = (c, id) => {
  const b = BRAND[c.chain];
  return b
    ? `<span class="vlogo ${b[1]}" data-testid="${id}-logo"><img src="logos/tiles/${b[0]}.png" alt="${esc(c.chain)}"></span>`
    : `<span class="vlogo initials" data-testid="${id}-logo" aria-hidden="true">LM</span>`;
};

// What a cinema still has today, optionally in one format only.
function today(c, format) {
  const rows = Object.entries(c.films).flatMap(([film, times]) => times.filter((x) => mins(x.t) > NOW && (!format || fmt(x.f) === format)).map((x) => ({ film, ...x })));
  rows.sort((a, b) => a.t.localeCompare(b.t));
  return { next: rows[0], films: new Set(rows.map((r) => r.film)).size, formats: [...new Set(Object.values(c.films).flat().map((x) => fmt(x.f)).filter(Boolean))] };
}
const list = (ids, format) => ids.map((id) => ({ c: cinemas[id], ...today(cinemas[id], format) })).filter((x) => x.next).sort((a, b) => a.next.t.localeCompare(b.next.t));
const inArea = (slug) => Object.keys(cinemas).filter((id) => cinemas[id].area === slug);

function row(x, id, saved, format, where) {
  const c = x.c;
  const tags = [...(format ? [format] : x.formats).map((f) => `<span class="vtag fmt" data-testid="${id}-tag-${f}">${f}</span>`), `<span class="vtag" data-testid="${id}-tag-book">${c.online ? "Book online" : "Tickets at the cinema"}</span>`];
  return `<article class="vrow" data-testid="${id}">
    ${logo(c, id)}
    <div><h3 class="vname" data-testid="${id}-name">${esc(c.name)}</h3>
      <p class="vnext" data-testid="${id}-next">${I.play}Next at ${x.next.t} <span>· ${x.films} ${x.films === 1 ? "film" : "films"}${format ? ` in ${format}` : ""}${where ? ` · ${areas[c.area].name}` : ""}</span></p>
      <div class="vtags">${tags.join("")}</div></div>
    <a class="vopen" href="#" aria-label="${esc(c.name)}: films and times" data-testid="${id}-open"></a>
    <button class="vfav" type="button" aria-label="${saved ? "Remove from" : "Add to"} your cinemas" data-testid="${id}-save">${I.heart(saved)}</button>
  </article>`;
}

function group(title, note, rows, gid, max, all, saved = [], format = null, where = false, after = "") {
  const shown = rows.slice(0, max);
  return `<section class="vgroup" data-testid="${gid}"><div class="vhead"><h2 data-testid="${gid}-title">${title}</h2><span data-testid="${gid}-note">${note}</span>${all ? `<a class="all" href="#" data-testid="${gid}-all">Show all${rows.length > max ? ` ${rows.length}` : ""}</a>` : ""}</div>${after}
    <div class="vgrid">${shown.map((x, i) => row(x, `${gid}-row-${i + 1}`, saved.includes(x.c.id), format, where)).join("")}</div></section>`;
}
const count = (n) => `${n} ${n === 1 ? "cinema" : "cinemas"}`;

function pageTop(phone) {
  const tabs = `<nav class="tabs" aria-label="Sections">${["Films", "Cinemas", "Starting soon"].map((t, i) => `<a class="tab${t === "Cinemas" ? " on" : ""}" href="#" data-testid="tab-${i + 1}">${t}</a>`).join("")}</nav>`;
  const logoLink = `<a class="logo" href="#" data-testid="wordmark">${I.mark}Sinima</a>`;
  return phone
    ? `<header class="top">${logoLink}<a class="round" href="#" aria-label="Search a film" data-testid="search-open">${I.search}</a></header>${tabs}`
    : `<header class="top">${logoLink}${tabs}<span class="search" data-testid="search">${I.search}Search a film</span></header>`;
}
// The filters. Desktop keeps the approved layout. A phone gets one of three tighter options (FILTER).
let FILTER = 1;
const fchips = (format) => `<div class="chips" data-testid="formats">${["Any format", "IMAX", "4D"].map((f, i) => `<a class="chip${(format || "Any format") === f ? " on" : ""}" href="#" data-testid="format-${i + 1}">${f}</a>`).join("")}</div>`;
const days = `<div class="days" data-testid="days"><a class="day on" href="#" data-testid="day-today">Today</a><a class="day" href="#" data-testid="day-tomorrow">Tomorrow</a></div>`;
const seg = `<div class="seg2" role="group" aria-label="Day" data-testid="days"><a class="on" href="#" data-testid="day-today">Today</a><a href="#" data-testid="day-tomorrow">Tomorrow</a></div>`;
const place = (area) => (area ? areas[area].name : "All Lagos");
function phoneFilters(area, format) {
  // 0 is today's design, kept for comparison: format chips, area chips over two lines, day tabs.
  if (FILTER === 0) return `<div style="margin-top:12px">${fchips(format)}</div><div class="filters"><div class="chips" style="flex-wrap:wrap" data-testid="areas">${["lekki", "victoria-island", "ikeja"].map((s, i) => `<a class="chip" href="#" data-testid="area-${i + 1}">${areas[s].name}</a>`).join("")}<a class="chip on" href="#" data-testid="area-all">All Lagos</a><a class="chip" href="#" data-testid="area-more">More areas${I.caret}</a></div></div><div class="filters">${days}</div>`;
  if (FILTER === 1) return `<div class="pickers" data-testid="pickers">
      <a class="picker" href="#" data-testid="pick-area">${I.pin}<span>${place(area)}</span>${I.caret}</a>
      <a class="picker" href="#" data-testid="pick-day"><span>Today</span>${I.caret}</a>
      <a class="picker${format ? " on" : ""}" href="#" data-testid="pick-format"><span>${format || "Format"}</span>${I.caret}</a></div>`;
  if (FILTER === 2) return `<div class="filters2" data-testid="filters2">${seg}<div class="chips" data-testid="formats">${["IMAX", "4D"].map((f, i) => `<a class="chip${format === f ? " on" : ""}" href="#" data-testid="format-${i + 2}">${f}</a>`).join("")}</div></div>`;
  return `<div class="summary" data-testid="summary"><p data-testid="summary-text">${I.pin}<b>${place(area)}</b> · Today · ${format || "Any format"}</p><a class="chip" href="#" data-testid="summary-edit">Filters${format ? " · 1" : ""}</a></div>`;
}
function head(phone, title, area, format) {
  if (phone) {
    // Option 2 puts the place in the heading itself: tap it to change area.
    const h1 = FILTER === 2
      ? `<h1 class="title">${title.replace(/(.*)<u>(.*)<\/u>/, `<span data-testid="title">$1</span><a class="place" href="#" data-testid="pick-area"><u>$2</u>${I.caret}</a>`)}</h1>`
      : `<h1 class="title" data-testid="title">${title}</h1>`;
    return `<div class="head">${h1}</div>${phoneFilters(area, format)}`;
  }
  const near = area ? [area, ...areas[area].neighbours] : ["lekki", "victoria-island", "ikeja"];
  const achips = `<div class="chips" data-testid="areas">${near.map((s, i) => `<a class="chip${s === area ? " on" : ""}" href="#" data-testid="area-${i + 1}">${s === area ? I.pin : ""}${areas[s].name}</a>`).join("")}<i class="sep"></i><a class="chip${area ? "" : " on"}" href="#" data-testid="area-all">All Lagos</a><a class="chip" href="#" data-testid="area-more">More areas${I.caret}</a></div>`;
  return `<div class="head"><h1 class="title" data-testid="title">${title}</h1>${fchips(format)}</div><div class="filters">${achips}${days}</div>`;
}
// Where the times come from: once, under the first list heading, with the list it describes.
const fresh = '<p class="vfresh" data-testid="fresh">Times read from Lagocine today at 01:36</p>';

// All of Lagos: one list, soonest first, each row naming its area (Instacart's "All grocery stores").
function allLagos(phone, format = null) {
  const rows = list(Object.keys(cinemas), format);
  const silent = format ? Object.values(cinemas).filter((c) => today(c).next && !today(c).formats.length).length : 0;
  return `${pageTop(phone)}<div class="wrap">${head(phone, format ? `Cinemas with <u>${format}</u>` : "Cinemas in <u>Lagos</u>", null, format)}
    ${group(format ? `Showing in ${format}` : "All cinemas", `${count(rows.length)} · soonest first`, rows, "group-all", phone ? 7 : 12, false, SAVED, format, true, fresh)}
    ${format ? `<p class="left-out" data-testid="left-out">${silent} cinemas don't say the format of their showings, so they are not listed here.</p>` : ""}</div>`;
}

// A saved area: your cinemas, the area, then next door.
const SAVED = ["filmhouse-lekki-imax", "ebonylife-vi"];
function areaPage(phone) {
  const area = "lekki", next = areas[area].neighbours;
  return `${pageTop(phone)}<div class="wrap">${head(phone, "Cinemas near <u>Lekki</u>", area)}
    ${group("Your cinemas", "tap a heart to keep one here", list(SAVED), "group-saved", 6, false, SAVED, null, true, fresh)}
    ${group("In Lekki", `${count(list(inArea(area)).length)} · soonest first`, list(inArea(area)), "group-area", 6, false, SAVED)}
    ${group("Next to Lekki", next.map((s) => areas[s].name).join(" and "), list(next.flatMap(inArea)), "group-next", 3, true, SAVED, null, true)}</div>`;
}

// A bottom sheet over the page: the area list (options 1 and 2) or every filter at once (option 3).
function sheet(kind) {
  const counts = (slug) => Object.values(cinemas).filter((c) => c.area === slug).length;
  const body = kind === "area"
    ? `<h3 data-testid="sheet-title">Choose an area</h3><div class="menu flat" data-testid="sheet-areas"><a href="#" class="on" data-testid="sheet-area-all">All Lagos<span>${Object.keys(cinemas).length} cinemas</span></a>${Object.entries(areas).map(([slug, a], i) => `<a href="#" data-testid="sheet-area-${i + 1}">${a.name}<span>${count(counts(slug))}</span></a>`).join("")}</div>`
    : `<h3 data-testid="sheet-title">Filters</h3>
       <p class="slabel" data-testid="sheet-l1">Area</p><div class="chips" style="flex-wrap:wrap">${["All Lagos", "Lekki", "Victoria Island", "Ikeja", "Surulere", "Yaba"].map((n, i) => `<a class="chip${i === 0 ? " on" : ""}" href="#" data-testid="sheet-area-${i + 1}">${n}</a>`).join("")}<a class="chip" href="#" data-testid="sheet-area-more">More areas${I.caret}</a></div>
       <p class="slabel" data-testid="sheet-l2">Day</p>${seg}
       <p class="slabel" data-testid="sheet-l3">Format</p>${fchips(null)}
       <a class="btn primary" href="#" data-testid="sheet-done">Show 20 cinemas</a>`;
  return `<div class="dim">${allLagos(true)}</div><section class="sheet" data-testid="sheet"><i class="grab"></i>${body}</section>`;
}
const at = (n, fn) => () => { const keep = FILTER; FILTER = n; const html = fn(); FILTER = keep; return html; };
const OPTIONS = [
  [1, "One row of pickers", "Area, day and format each become one picker in a single row; each opens a sheet from the bottom. The most compact."],
  [2, "The place is in the heading", "Tap “Lagos” in the heading to change area. One row under it: Today or Tomorrow, then IMAX and 4D."],
  [3, "One summary line", "One line says what you are looking at; Filters opens a single sheet with area, day and format together."],
];
const FRAMES = [
  ["cinemas-desktop", "desk", "Desktop · all of Lagos", () => allLagos(false)],
  ["cinemas-phone", "phone", "Phone · all of Lagos", () => allLagos(true)],
  ["cinemas-phone--area", "phone", "Phone · your area (Lekki), with your cinemas", () => areaPage(true)],
  ["cinemas-phone--imax", "phone", "Phone · IMAX chosen", () => allLagos(true, "IMAX")],
  ["cinemas-desktop--area", "desk", "Desktop · your area (Lekki)", () => areaPage(false)],
  ...OPTIONS.map(([n, name]) => [`filters-${n}`, "phone fixed", `Option ${n} · ${name}`, at(n, () => allLagos(true))]),
  ["filters-1--sheet", "phone fixed", "Options 1 and 2 · tap the area: a sheet", at(1, () => sheet("area"))],
  ["filters-3--sheet", "phone fixed", "Option 3 · tap Filters: one sheet", at(3, () => sheet("all"))],
];
const frame = ([id, kind, cap, render]) => `<figure class="shot"><figcaption data-testid="${id}-caption">${cap}<span class="measure" data-for="${id}"></span></figcaption><div class="frame ${kind}" data-screen="${id}">${render()}</div></figure>`;
const byId = (id) => FRAMES.find((f) => f[0] === id);
const shown = FRAMES.filter((f) => !ONLY || f[1].startsWith(ONLY));
document.getElementById("screens").innerHTML = ONLY
  ? `<div class="frames">${shown.map(frame).join("")}</div>`
  : `<section class="screen"><h2 data-testid="s0">1 · Phone filters: three options</h2><p data-testid="s0-say">Your note: the filters take too much of the screen and look scattered. Here are three ways to fit them in less. Under each frame is how far down the first cinema starts, measured on this page; today's design is the first frame. Pick one with the buttons at the bottom.</p>
      <div class="frames">${frame(["filters-0", "phone fixed", "Today's design", at(0, () => allLagos(true))])}${OPTIONS.map(([n]) => frame(byId(`filters-${n}`))).join("")}${frame(byId("filters-1--sheet"))}${frame(byId("filters-3--sheet"))}</div></section>
    <section class="screen"><h2 data-testid="s1">2 · The list, logos centred</h2><p data-testid="s1-say">Every logo is trimmed to its own marks and centred in its tile, measured to the pixel. Magnificent now has its own logo: their only logo is a one-line banner (red “Magnificent”, blue “Cinemas”) too thin to read in a tile, so its two halves are stacked here. That re-arranges their mark; say if you would rather show it as one line. The phone frames use the filter option chosen in the bar above.</p>
      <div class="frames">${frame(byId("cinemas-phone"))}${frame(byId("cinemas-phone--area"))}${frame(byId("cinemas-phone--imax"))}</div></section>
    <section class="screen"><h2 data-testid="s2">3 · Desktop</h2><p data-testid="s2-say">“Times read from Lagocine” now sits under the list heading with the cinemas it describes, not against the filters.</p><div class="frames">${frame(byId("cinemas-desktop"))}${frame(byId("cinemas-desktop--area"))}</div></section>
    <div class="answer"><p id="picked" data-testid="pick-say">Choose the filter option you want, then press Copy and paste the line to Claude with anything else you want changed.</p>
      <span class="seg" role="group" aria-label="Filter option">${OPTIONS.map(([n]) => `<button type="button" aria-pressed="${n === 1}" data-pick="${n}" data-testid="pick-${n}">Option ${n}</button>`).join("")}</span><button type="button" id="pickbtn" data-testid="pick-copy">Copy my pick</button></div>`;

// Measure where the first cinema starts in each frame (the frame's own top is 0).
const measure = () => document.querySelectorAll(".measure").forEach((m) => {
  const f = document.querySelector(`[data-screen="${m.dataset.for}"]`), r = f && f.querySelector(".vrow");
  if (r && !f.querySelector(".sheet")) m.textContent = ` · first cinema at ${Math.round((r.getBoundingClientRect().top - f.getBoundingClientRect().top) / (f.getBoundingClientRect().width / f.offsetWidth))} px`;
});
requestAnimationFrame(measure);
const rerender = () => { document.querySelectorAll('[data-screen^="cinemas-phone"]').forEach((f) => { f.innerHTML = byId(f.dataset.screen)[3](); }); requestAnimationFrame(measure); };
document.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => { FILTER = Number(b.dataset.pick); b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); rerender(); }));
document.getElementById("pickbtn")?.addEventListener("click", async () => {
  const text = `Cinemas tab: filter option ${FILTER}. Changes I want: `;
  try { await navigator.clipboard.writeText(text); document.getElementById("picked").textContent = `Copied: "${text}" Paste it to Claude.`; } catch { document.getElementById("picked").textContent = `Tell Claude: "${text}"`; }
});

const root = document.documentElement;
document.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => { root.dataset.theme = b.dataset.themeSet; b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
document.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => { document.body.classList.toggle("fit", b.dataset.size === "fit"); b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
document.addEventListener("click", (e) => { if (e.target.closest(".frame a")) e.preventDefault(); });
