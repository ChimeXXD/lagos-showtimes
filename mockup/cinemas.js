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

// Each chain's logo on the tile it reads best on (checked on white and on near-black).
const BRAND = {
  Filmhouse: ["filmhouse.png", "dark"], Genesis: ["genesis.png", "light"], EbonyLife: ["ebonylife.webp", "dark zoom"],
  Silverbird: ["silverbird.png", "light"], "Blue Pictures": ["bluepictures.png", "light"], Filmworld: ["filmworld.png", "light"],
  Grand: ["grand.png", "dark"], Ozone: ["ozone.jpg", "fill"], Sky: ["sky.svg", "dark"], THC: ["thc.png", "dark"], Viva: ["viva.webp", "dark"],
};
const INITIALS = { Magnificent: "MC", "Independent (unverified)": "LM" };
const logo = (c, id) => {
  const b = BRAND[c.chain];
  return b
    ? `<span class="vlogo ${b[1]}" data-testid="${id}-logo"><img src="logos/${b[0]}" alt="${esc(c.chain)}"></span>`
    : `<span class="vlogo initials" data-testid="${id}-logo" aria-hidden="true">${INITIALS[c.chain] || c.name.slice(0, 2)}</span>`;
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

function group(title, note, rows, gid, max, all, saved = [], format = null, where = false) {
  const shown = rows.slice(0, max);
  return `<section class="vgroup" data-testid="${gid}"><div class="vhead"><h2 data-testid="${gid}-title">${title}</h2><span data-testid="${gid}-note">${note}</span>${all ? `<a class="all" href="#" data-testid="${gid}-all">Show all${rows.length > max ? ` ${rows.length}` : ""}</a>` : ""}</div>
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
function head(phone, title, area, format) {
  const fchips = `<div class="chips" data-testid="formats">${["Any format", "IMAX", "4D"].map((f, i) => `<a class="chip${(format || "Any format") === f ? " on" : ""}" href="#" data-testid="format-${i + 1}">${f}</a>`).join("")}</div>`;
  const near = area ? [area, ...areas[area].neighbours] : ["lekki", "victoria-island", "ikeja"];
  const achips = `<div class="chips" style="flex-wrap:wrap" data-testid="areas">${near.map((s, i) => `<a class="chip${s === area ? " on" : ""}" href="#" data-testid="area-${i + 1}">${s === area ? I.pin : ""}${areas[s].name}</a>`).join("")}${phone ? "" : '<i class="sep"></i>'}<a class="chip${area ? "" : " on"}" href="#" data-testid="area-all">All Lagos</a><a class="chip" href="#" data-testid="area-more">More areas${I.caret}</a></div>`;
  const days = `<div class="days" data-testid="days"><a class="day on" href="#" data-testid="day-today">Today</a><a class="day" href="#" data-testid="day-tomorrow">Tomorrow</a></div>`;
  return `<div class="head"><h1 class="title" data-testid="title">${title}</h1>${phone ? "" : fchips}</div>
    ${phone ? `<div style="margin-top:12px">${fchips}</div>` : ""}<div class="filters">${achips}${phone ? "" : days}</div>${phone ? `<div class="filters">${days}</div>` : ""}
    <p class="vfresh" data-testid="fresh">Times read from Lagocine today at 01:36</p>`;
}

// All of Lagos: one list, soonest first, each row naming its area (Instacart's "All grocery stores").
function allLagos(phone, format = null) {
  const rows = list(Object.keys(cinemas), format);
  const silent = format ? Object.values(cinemas).filter((c) => today(c).next && !today(c).formats.length).length : 0;
  return `${pageTop(phone)}<div class="wrap">${head(phone, format ? `Cinemas with <u>${format}</u>` : "Cinemas in <u>Lagos</u>", null, format)}
    ${group(format ? `Showing in ${format}` : "All cinemas", `${count(rows.length)} · soonest first`, rows, "group-all", phone ? 7 : 12, false, SAVED, format, true)}
    ${format ? `<p class="left-out" data-testid="left-out">${silent} cinemas don't say the format of their showings, so they are not listed here.</p>` : ""}</div>`;
}

// A saved area: your cinemas, the area, then next door.
const SAVED = ["filmhouse-lekki-imax", "ebonylife-vi"];
function areaPage(phone) {
  const area = "lekki", next = areas[area].neighbours;
  return `${pageTop(phone)}<div class="wrap">${head(phone, "Cinemas near <u>Lekki</u>", area)}
    ${group("Your cinemas", "tap a heart to keep one here", list(SAVED), "group-saved", 6, false, SAVED, null, true)}
    ${group("In Lekki", `${count(list(inArea(area)).length)} · soonest first`, list(inArea(area)), "group-area", 6, false, SAVED)}
    ${group("Next to Lekki", next.map((s) => areas[s].name).join(" and "), list(next.flatMap(inArea)), "group-next", 3, true, SAVED, null, true)}</div>`;
}

const FRAMES = [
  ["cinemas-desktop", "desk", "Desktop · all of Lagos, grouped by area", () => allLagos(false)],
  ["cinemas-phone", "phone", "Phone · all of Lagos", () => allLagos(true)],
  ["cinemas-phone--area", "phone", "Phone · your area (Lekki), with your cinemas", () => areaPage(true)],
  ["cinemas-phone--imax", "phone", "Phone · IMAX chosen", () => allLagos(true, "IMAX")],
  ["cinemas-desktop--area", "desk", "Desktop · your area (Lekki)", () => areaPage(false)],
];
const frame = ([id, kind, cap, render]) => `<figure class="shot"><figcaption data-testid="${id}-caption">${cap}</figcaption><div class="frame ${kind}" data-screen="${id}">${render()}</div></figure>`;
const shown = FRAMES.filter((f) => !ONLY || f[1] === ONLY);
document.getElementById("screens").innerHTML = ONLY
  ? `<div class="frames">${shown.map(frame).join("")}</div>`
  : `<section class="screen"><h2 data-testid="s1">Phone: before and after</h2><p data-testid="s1-say">Left is the live page today. Right is the redesign: one row per cinema with its logo, the next time in Teal, and small tags. The film rows, poster strips and “View all” links are gone from this page; tap a cinema to see its films and times.</p>
      <div class="compare"><figure class="before"><figcaption data-testid="before-caption">Before · live today</figcaption><img src="shots/before-phone-cinemas.png" alt="The live Cinemas page before the redesign" data-testid="before-img"></figure>${frame(FRAMES[1])}${frame(FRAMES[2])}${frame(FRAMES[3])}</div></section>
    <section class="screen"><h2 data-testid="s2">Desktop</h2><p data-testid="s2-say">Three cards across. On your area’s page they come in groups: your cinemas, the area, next door. Each group's “Show all” sits on its heading line, so it belongs to the group (your Instacart web pick).</p><div class="frames">${frame(FRAMES[0])}${frame(FRAMES[4])}</div></section>`;

const root = document.documentElement;
document.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => { root.dataset.theme = b.dataset.themeSet; b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
document.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => { document.body.classList.toggle("fit", b.dataset.size === "fit"); b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
document.addEventListener("click", (e) => { if (e.target.closest(".frame a")) e.preventDefault(); });
