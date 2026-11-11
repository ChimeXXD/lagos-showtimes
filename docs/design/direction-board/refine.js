// refine.html: the three identities Chime picked, refined and shown in full.
// Each mark is drawn on a 100 x 100 grid; `box` is the tight frame used when it sits beside the word.
const IDS = [
  { id: "screen", name: "Screen face", set: "Ink and blue", chips: ["Friendly", "Plain-spoken", "Quick"], tagline: "What's starting soon?",
    idea: "A cinema screen that looks back at you: two eyes glancing toward what is about to start.",
    changed: "Refined: taller screen with softer corners, larger eyes set a little wider, and pupils that look up and across toward the name instead of straight sideways.",
    box: "13 24 74 52",
    svg: `<rect class="m" x="13" y="24" width="74" height="52" rx="18"/><circle class="cut" cx="37" cy="50" r="10.5"/><circle class="cut" cx="63" cy="50" r="10.5"/><circle class="a" cx="41" cy="48" r="5.2"/><circle class="a" cx="67" cy="48" r="5.2"/>`,
    dark: ["#0a0a0a", "#ffffff", "#8fb4f5"], light: ["#ffffff", "#0a0a0a", "#2f5fb3"], icon: "dark",
    swatches: [["Ink", "#0a0a0a", "Text, start times, capsules, app icon"], ["Screen blue", "#2f5fb3", "Book button and the eyes"], ["Sky", "#8fb4f5", "Blue in dark mode"], ["Mist", "#f3f3f3", "Tiles and quiet surfaces"], ["Paper", "#ffffff", "Page background"]],
    ui: { page: "#ffffff", surface: "#f3f3f3", text: "#0a0a0a", muted: "#555555", btn: "#2f5fb3", btnText: "#ffffff" } },
  { id: "ticket", name: "Ticket S", set: "Cream and brown", chips: ["Warm", "Classic", "Cinema"], tagline: "Every showing, one ticket away.",
    idea: "A cinema ticket with two bites out of it, one high on the right and one low on the left, so the ticket itself becomes an S.",
    changed: "Refined: deeper notches so the S reads sooner, a taller ticket, and the three tear-line dots made smaller and tighter so they stay a detail. The red is a shade deeper so white text on the Book button is easy to read.",
    box: "19 9 62 82",
    svg: `<rect class="m" x="19" y="9" width="62" height="82" rx="19"/><circle class="cut" cx="81" cy="33" r="15"/><circle class="cut" cx="19" cy="67" r="15"/><circle class="a" cx="39.5" cy="50" r="3.4"/><circle class="a" cx="50" cy="50" r="3.4"/><circle class="a" cx="60.5" cy="50" r="3.4"/>`,
    dark: ["#2a1a14", "#f7eedc", "#f0705c"], light: ["#f7eedc", "#2a1a14", "#c5371f"], icon: "light", mono: "mono-cut",
    swatches: [["Cocoa", "#2a1a14", "Text, start times, capsules"], ["Tomato", "#c5371f", "Book button and the tear line"], ["Sand", "#eadfc8", "Tiles and quiet surfaces"], ["Cream", "#f7eedc", "Page background"], ["Paper", "#fffaf0", "Sheets and cards"]],
    ui: { page: "#f7eedc", surface: "#eadfc8", text: "#2a1a14", muted: "#6a5448", btn: "#c5371f", btnText: "#ffffff" } },
  { id: "front", name: "Front row", set: "Marigold night", chips: ["Evening", "Bold", "Lagos"], tagline: "Tonight starts here.",
    idea: "You, seen from behind, in front of the screen. It also reads as the sun going down: the moment the evening shows begin.",
    changed: "Refined: a wider screen with rounder corners, and the half circle sized to exactly half the screen's width so the two shapes feel made for each other.",
    box: "8 18 84 64",
    svg: `<rect class="m" x="8" y="18" width="84" height="64" rx="21"/><path class="a" d="M29 82A21 21 0 0 1 71 82Z"/>`,
    dark: ["#1e2657", "#f6efdd", "#e9a93c"], light: ["#f6efdd", "#1e2657", "#e9a93c"], icon: "dark", mono: "mono-cut", tagLight: "#1e2657",
    swatches: [["Night", "#1e2657", "Text, start times, capsules, app icon"], ["Marigold", "#e9a93c", "Book button and the sun"], ["Dawn", "#efe3c6", "Tiles and quiet surfaces"], ["Cream", "#f6efdd", "Page background"], ["Ink", "#171b33", "Body text on Cream"]],
    ui: { page: "#f6efdd", surface: "#efe3c6", text: "#1e2657", muted: "#565a78", btn: "#e9a93c", btnText: "#1e2657" } },
];
const PALM = ["#0f3b2e", "#eaf4e4", "#d9e86a"];

const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => ((Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)).toFixed(1);
const edge = (h) => (lum(h) > 0.8 ? " edge" : "");
const mark = (d) => `<svg viewBox="${d.box}" aria-hidden="true">${d.svg}</svg>`;
const icon = (d, s, cls) => `<span class="icon ${cls}" style="--s:${s}px"><svg viewBox="0 0 100 100" aria-hidden="true">${d.svg}</svg></span>`;
const vars = (d) => `--d-bg:${d.dark[0]};--d-fg:${d.dark[1]};--d-ac:${d.dark[2]};--l-bg:${d.light[0]};--l-fg:${d.light[1]};--l-ac:${d.light[2]};--u-page:${d.ui.page};--u-surface:${d.ui.surface};--u-text:${d.ui.text};--u-muted:${d.ui.muted};--u-btn:${d.ui.btn};--u-btn-text:${d.ui.btnText}`;
const hero = (d, mode, cap) => `<figure class="hero on-${mode}${edge(d[mode][0])}"><div class="lockup">${mark(d)}<span class="word">Sinima</span></div><p class="tagline"${mode === "light" && d.tagLight ? ` style="color:${d.tagLight}"` : ""}>${d.tagline}</p><figcaption>${cap}</figcaption></figure>`;
const row = (t, soon, film, where) => `<li><span class="p-poster">${film}</span><div><p class="p-time">${t} <span class="soon">${soon}</span></p><p class="p-film">${film}</p><p class="p-meta">${where}</p><p class="p-fresh">From Lagocine, which read Filmhouse's site 25 min ago</p><span class="btn book sm">Book</span></div></li>`;

document.getElementById("jump").innerHTML = IDS.map((d) => `<a href="#${d.id}">${d.name}</a>`).join("") + `<a href="#palm">All three in Palm</a>`;
document.getElementById("ids").innerHTML = IDS.map((d, i) => {
  const ic = `on-${d.icon}`;
  const other = d.icon === "dark" ? "light" : "dark";
  return `<section class="id" id="${d.id}" style="${vars(d)}">
  <div class="id-head"><div><p class="eyebrow">${i + 1} of 3 · ${d.set}</p><h2>${d.name}</h2><p class="id-idea">${d.idea}</p></div><ul class="chips">${d.chips.map((c) => `<li>${c}</li>`).join("")}</ul></div>
  <p class="changed">${d.changed}</p>
  <div class="heroes">${hero(d, "dark", "Primary lockup, dark")}${hero(d, "light", "Primary lockup, light")}</div>
  <div class="four">
    <figure class="card"><div class="stage on-light" style="background:none">${mark(d)}</div><figcaption>Mark</figcaption></figure>
    <figure class="card"><div class="stage">${icon(d, 104, ic + edge(d[d.icon][0]))}</div><figcaption>App icon</figcaption></figure>
    <figure class="card"><div class="stage">${icon(d, 72, `on-${other} ${d.mono ?? "mono"}${edge(d[other][0])}`)}${icon(d, 72, `${ic} ${d.mono ?? "mono"}${edge(d[d.icon][0])}`)}</div><figcaption>One colour</figcaption></figure>
    <figure class="card"><div class="stage stage-col"><div class="tab">${icon(d, 16, ic)}<span>Sinima · Starting soon in Lekki</span></div><div class="sizes">${icon(d, 48, ic + edge(d[d.icon][0]))}${icon(d, 32, ic + edge(d[d.icon][0]))}${icon(d, 16, ic)}</div></div><figcaption>Favicon at actual size: tab, 48, 32, 16</figcaption></figure>
  </div>
  <div class="two">
    <div class="card pad"><p class="eyebrow">Colour</p>
      <ul class="swatches">${d.swatches.map(([n, h, use]) => `<li><span class="sw" style="background:${h}"></span><b>${n}</b><code>${h.toUpperCase()}</code><small>${use}</small></li>`).join("")}</ul>
      <p class="checks">Contrast, measured: text on the page ${ratio(d.ui.text, d.ui.page)}:1 · grey text ${ratio(d.ui.muted, d.ui.page)}:1 · Book button label ${ratio(d.ui.btnText, d.ui.btn)}:1. The target is 4.5:1 or more (7:1 for start times).</p>
    </div>
    <div class="card pad" style="background:var(--u-page)"><p class="eyebrow">Type</p>
      <p class="type-head">What's starting soon near you?</p><p class="type-note">Outfit 600 · headlines, start times and the wordmark</p>
      <p class="type-body" style="color:var(--u-text)">Every Lagos cinema's showtimes in one place. Each time says where it came from and how fresh it is.</p><p class="type-note">Outfit 400 · body and interface</p>
      <div class="buttons"><span class="btn book">Book</span><span class="btn solid">Lekki ▾</span><span class="btn ghost">Remind me</span></div>
    </div>
  </div>
  <div class="inapp">
    <div class="phone"><div class="p-top"><span class="p-brand on-light" style="background:none;--cut:var(--u-page)">${mark(d)}Sinima</span><span class="btn solid sm">Lekki ▾</span></div>
      <h3 class="p-title">Starting soon in Lekki</h3>
      <ul class="p-rows">${row("19:00", "Starts in 15 min", "Clayface", "Filmhouse Lekki IMAX · IMAX")}${row("20:10", "Starts in 1 h 25 min", "Street Fighter", "Filmhouse Palms Mall Lekki · 3D")}</ul></div>
    <p class="inapp-note">The Starting soon screen in these colours. Sample showings; the dark tiles stand in for film posters.</p>
  </div>
</section>`;
}).join("");

document.getElementById("palm").innerHTML = `<p class="eyebrow">Also</p><h2>All three in Palm green</h2>
  <div class="palm-row">${IDS.map((d) => `<figure class="hero on-dark" style="--d-bg:${PALM[0]};--d-fg:${PALM[1]};--d-ac:${PALM[2]}"><div class="lockup">${mark(d)}<span class="word">Sinima</span></div><figcaption>${d.name}</figcaption></figure>`).join("")}</div>`;

const KEY = "sinima-refine-pick";
const OPTIONS = [...IDS.map((d) => `${d.name} (${d.set})`), "Still deciding"];
document.getElementById("choices").innerHTML = OPTIONS.map((o) => `<button type="button" data-pick="${o}" aria-pressed="false">${o.replace(/ \(.*/, "")}</button>`).join("");
const note = document.getElementById("note");
const statusLine = document.getElementById("status");
const choice = { pick: "", note: "" };
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* private window: the pick still works until the page closes */ }
}
function show() {
  document.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pick === choice.pick)));
  statusLine.textContent = choice.pick ? `${choice.pick}. Saved in this browser.` : "Choose one, or write what to change.";
}
try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
  if (saved && typeof saved === "object") { choice.pick = String(saved.pick ?? ""); choice.note = String(saved.note ?? ""); }
} catch { /* nothing saved, or storage is blocked */ }
note.value = choice.note;
show();
document.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => { choice.pick = b.dataset.pick; save(); show(); }));
note.addEventListener("input", () => { choice.note = note.value; save(); });
document.getElementById("copy").addEventListener("click", async () => {
  if (!choice.pick && !choice.note.trim()) { statusLine.textContent = "Choose one, or write what to change."; return; }
  const text = `Pick: ${choice.pick || "none yet"} | Note: ${choice.note.trim() || "none"}`;
  try { await navigator.clipboard.writeText(text); statusLine.textContent = "Copied. Paste it to Claude."; } catch { statusLine.textContent = `Copy this: ${text}`; }
});
