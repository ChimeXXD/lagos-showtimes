// ticket.html: the Ticket S mark as one cut shape, and six colour sets for the logo and the app.

// --- The mark. A rounded ticket with a round notch high on the right and low on the left, so it reads as an S.
// Each notch meets the edge through a small rounded shoulder, and flows straight into the corner above or below it.
const G = { L: 19, R: 81, T: 8, B: 92, corner: 15, notch: 12, shoulder: 3.5, dot: 3.4, dots: [39.5, 50, 60.5] };
const n2 = (v) => Number(v.toFixed(2));
function ticketPath(holes) {
  const { L, R, T, B, corner: c, notch: n, shoulder: f, dot, dots } = G;
  const h = Math.sqrt((n + f) ** 2 - f ** 2); // from the notch's centre to where a shoulder meets the edge
  const yR = T + c + h; // right notch sits directly under the top-right corner
  const yL = B - c - h; // left notch sits directly above the bottom-left corner
  const touch = (cx, cy, fx, fy) => [n2(cx + (n / (n + f)) * (fx - cx)), n2(cy + (n / (n + f)) * (fy - cy))];
  const r1 = touch(R, yR, R - f, yR - h), r2 = touch(R, yR, R - f, yR + h);
  const l1 = touch(L, yL, L + f, yL + h), l2 = touch(L, yL, L + f, yL - h);
  const body = `M${L + c} ${T}H${R - c}A${c} ${c} 0 0 1 ${R} ${T + c}A${f} ${f} 0 0 1 ${r1}A${n} ${n} 0 0 0 ${r2}A${f} ${f} 0 0 1 ${R} ${n2(yR + h)}V${B - c}A${c} ${c} 0 0 1 ${R - c} ${B}H${L + c}A${c} ${c} 0 0 1 ${L} ${B - c}A${f} ${f} 0 0 1 ${l1}A${n} ${n} 0 0 0 ${l2}A${f} ${f} 0 0 1 ${L} ${n2(yL - h)}V${T + c}A${c} ${c} 0 0 1 ${L + c} ${T}Z`;
  const hole = (x) => `M${n2(x - dot)} 50a${dot} ${dot} 0 1 0 ${dot * 2} 0a${dot} ${dot} 0 1 0 ${-dot * 2} 0Z`;
  return { body: holes ? body + dots.map(hole).join("") : body, yR: n2(yR), yL: n2(yL) };
}
const SHAPE = ticketPath(true);
const BOX = `${G.L} ${G.T} ${G.R - G.L} ${G.B - G.T}`;
const dotsSvg = G.dots.map((x) => `<circle cx="${x}" cy="50" r="${G.dot}"/>`).join("");
// Two colours: the body (with real holes) plus coloured dots sitting in the holes. One colour: the holes stay empty.
const mark = (twoColour = true, attrs = "") => `<svg viewBox="${BOX}" aria-hidden="true" ${attrs}><path class="body" fill-rule="evenodd" d="${SHAPE.body}"/>${twoColour ? `<g class="dots">${dotsSvg}</g>` : ""}</svg>`;

// --- Colour sets: light mode first, then dark mode.
const SETS = [
  { name: "Cream and brown", idea: "The one you picked. Warm paper, cocoa ink and a tomato-red button: an old cinema ticket.",
    l: { page: "#f7eedc", surface: "#eadfc8", text: "#2a1a14", muted: "#6a5448", btn: "#c5371f" },
    d: { page: "#1a100c", surface: "#2a1a14", text: "#f7eedc", muted: "#c2ae9f", btn: "#f0705c" }, names: ["Cocoa", "Tomato", "Sand", "Cream", "Night cocoa"] },
  { name: "Palm", idea: "Deep palm green on a soft mint page, with a lime button. Fresh, calm and unlike any other cinema brand in Lagos.",
    l: { page: "#eef5e8", surface: "#dcebd2", text: "#0f3b2e", muted: "#4c6a5e", btn: "#d9e86a" },
    d: { page: "#082419", surface: "#0f3b2e", text: "#eaf4e4", muted: "#a9c4b6", btn: "#d9e86a" }, names: ["Palm", "Lime", "Leaf", "Mint", "Night palm"] },
  { name: "Marigold night", idea: "Navy and marigold on cream: the evening sky as the shows begin.",
    l: { page: "#f6efdd", surface: "#efe3c6", text: "#1e2657", muted: "#565a78", btn: "#e9a93c" },
    d: { page: "#11163a", surface: "#1e2657", text: "#f6efdd", muted: "#b4b8d2", btn: "#e9a93c" }, names: ["Night", "Marigold", "Dawn", "Cream", "Midnight"] },
  { name: "Ink and blue", idea: "Black and white with one calm blue. The plainest: the times and posters do the talking. This is what the app uses today.",
    l: { page: "#ffffff", surface: "#f3f3f3", text: "#0a0a0a", muted: "#555555", btn: "#2f5fb3" },
    d: { page: "#0a0a0a", surface: "#1a1a1a", text: "#fafafa", muted: "#ababab", btn: "#8fb4f5" }, names: ["Ink", "Screen blue", "Mist", "Paper", "Black"] },
  { name: "Lagoon", idea: "Deep lagoon teal on a pale sea-mist page, with a green-teal button. Cool and clean.",
    l: { page: "#eef6f4", surface: "#d9ebe7", text: "#0c3b47", muted: "#48666e", btn: "#0b6e69" },
    d: { page: "#062028", surface: "#0c3b47", text: "#eaf5f3", muted: "#a3c0c4", btn: "#5fd4c8" }, names: ["Lagoon", "Teal", "Sea mist", "Foam", "Deep water"] },
  { name: "Danfo", idea: "The yellow and black of a Lagos danfo bus. The loudest, and the most Lagos.",
    l: { page: "#fffbea", surface: "#f6ecc2", text: "#15130c", muted: "#5e5a4c", btn: "#ffcb05" },
    d: { page: "#141309", surface: "#211f12", text: "#fbf7e6", muted: "#b5af98", btn: "#ffcb05" }, names: ["Tar", "Danfo yellow", "Dust", "Butter", "Night tar"] },
];
const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
// The Book label takes whichever of the two text colours reads better on the button.
const label = (m, other) => (ratio(m.btn, m.text) >= ratio(m.btn, other.text) ? m.text : other.text);
for (const s of SETS) { s.l.btnText = label(s.l, s.d); s.d.btnText = label(s.d, s.l); }
// The dots take the button colour when it shows up on the mark; otherwise they stay as holes showing the page.
for (const s of SETS) for (const m of [s.l, s.d]) m.ac = ratio(m.btn, m.text) >= 2.5 ? m.btn : m.page;
const key = (k) => (k === "btnText" ? "btn-text" : k === "ac" ? "dot" : k);
const vars = (s) => [...Object.entries(s.l).map(([k, v]) => `--${key(k)}:${v}`), ...Object.entries(s.d).map(([k, v]) => `--d-${key(k)}:${v}`)].join(";");
const row = (t, soon, film, where) => `<li><span class="p-poster">${film}</span><div><p class="p-time">${t} <span class="soon">${soon}</span></p><p class="p-film">${film}</p><p class="p-meta">${where}</p><p class="p-fresh">From Lagocine, which read Filmhouse's site 25 min ago</p><span class="btn book">Book</span></div></li>`;
const phone = (mode) => `<div class="phone ${mode}"><div class="p-top"><span class="p-brand">${mark()}Sinima</span><span class="btn solid">Lekki ▾</span></div>
  <h3 class="p-title">Starting soon in Lekki</h3>
  <ul class="p-rows">${row("19:00", "Starts in 15 min", "Clayface", "Filmhouse Lekki IMAX · IMAX")}${row("20:10", "Starts in 1 h 25 min", "Street Fighter", "Filmhouse Palms Mall Lekki · 3D")}</ul></div>`;
const f1 = (n) => n.toFixed(1);

document.getElementById("craft").innerHTML = `
  <figure class="build"><div class="stage"><svg viewBox="${BOX}" aria-hidden="true"><path class="outline" fill-rule="evenodd" d="${SHAPE.body}"/><circle class="guide" cx="${G.R}" cy="${SHAPE.yR}" r="${G.notch}"/><circle class="guide" cx="${G.L}" cy="${SHAPE.yL}" r="${G.notch}"/><path class="guide" d="M${G.L - 6} 50H${G.R + 6}"/></svg></div><figcaption>How it is built: one outline, two equal round notches, three holes on the centre line</figcaption></figure>
  <figure><div class="stage checker" style="color:#2a1a14;--ac:#c5371f">${mark()}</div><figcaption>On a checkerboard: the notches are truly empty</figcaption></figure>
  <figure><div class="stage stripes">${mark(false)}</div><figcaption>One colour on a pattern: the dots are holes too</figcaption></figure>
  <figure><div class="stage" style="color:#2a1a14;--ac:#c5371f"><div class="row-sizes">${[96, 48, 32, 16].map((s) => mark(true, `style="height:${s}px"`)).join("")}</div></div><figcaption>At 96, 48, 32 and 16 pixels</figcaption></figure>`;

document.getElementById("sets").innerHTML = SETS.map((s, i) => {
  const sw = [[s.names[0], s.l.text, "Text, start times, capsules"], [s.names[1], s.l.btn, "Book button, the dots"], [s.names[2], s.l.surface, "Tiles, quiet surfaces"], [s.names[3], s.l.page, "Page background"], [s.names[4], s.d.page, "Page in dark mode"]];
  return `<section class="set" style="${vars(s)}">
  <div class="set-head"><p class="eyebrow">Colour set ${i + 1} of ${SETS.length}</p><h2>${s.name}</h2><p class="set-idea">${s.idea}</p></div>
  <div class="heroes">
    <figure class="hero l${lum(s.l.page) > 0.8 ? " edge" : ""}"><div class="lockup">${mark()}<span class="word">Sinima</span></div><figcaption>Light</figcaption></figure>
    <figure class="hero d"><div class="lockup">${mark()}<span class="word">Sinima</span></div><figcaption>Dark</figcaption></figure>
  </div>
  <div class="mid">
    <div class="card"><p class="eyebrow">App icon</p><div class="icons">${[96, 60, 32].map((z) => `<span class="icon l edge" style="--s:${z}px">${mark()}</span>`).join("")}${[96, 60, 32].map((z) => `<span class="icon d" style="--s:${z}px">${mark()}</span>`).join("")}</div></div>
    <div class="card"><p class="eyebrow">Colour</p><ul class="swatches">${sw.map(([n, h, use]) => `<li><span class="sw" style="background:${h}"></span><b>${n}</b><code>${h.toUpperCase()}</code><small>${use}</small></li>`).join("")}</ul>
      <p class="checks">Contrast, measured. Light: text ${f1(ratio(s.l.text, s.l.page))}:1, grey text ${f1(ratio(s.l.muted, s.l.page))}:1, Book label ${f1(ratio(s.l.btnText, s.l.btn))}:1. Dark: text ${f1(ratio(s.d.text, s.d.page))}:1, grey text ${f1(ratio(s.d.muted, s.d.page))}:1, Book label ${f1(ratio(s.d.btnText, s.d.btn))}:1. Target: 4.5:1 or more.</p></div>
  </div>
  <div class="phones">${phone("l")}${phone("d")}</div>
  <button class="pick" type="button" aria-pressed="false" data-pick="${s.name}">Pick ${s.name}</button>
</section>`;
}).join("");

const KEY = "sinima-ticket-colours";
document.getElementById("choices").innerHTML = SETS.map((s) => `<button type="button" data-pick="${s.name}" aria-pressed="false">${s.name}</button>`).join("");
const note = document.getElementById("note");
const statusLine = document.getElementById("status");
const choice = { pick: "", note: "" };
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* private window: the pick still works until the page closes */ }
}
function show() {
  document.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pick === choice.pick)));
  statusLine.textContent = choice.pick ? `${choice.pick}. Saved in this browser.` : "Choose a colour set.";
}
try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
  if (saved && typeof saved === "object") { choice.pick = String(saved.pick ?? ""); choice.note = String(saved.note ?? ""); }
} catch { /* nothing saved, or storage is blocked */ }
note.value = choice.note;
show();
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-pick]");
  if (b) { choice.pick = b.dataset.pick; save(); show(); }
});
note.addEventListener("input", () => { choice.note = note.value; save(); });
document.getElementById("copy").addEventListener("click", async () => {
  if (!choice.pick && !choice.note.trim()) { statusLine.textContent = "Choose a colour set, or write a note."; return; }
  const text = `Ticket S colours: ${choice.pick || "none yet"} | Note: ${choice.note.trim() || "none"}`;
  try { await navigator.clipboard.writeText(text); statusLine.textContent = "Copied. Paste it to Claude."; } catch { statusLine.textContent = `Copy this: ${text}`; }
});
// For saving the final files: the exact path of the mark.
document.documentElement.dataset.markPath = SHAPE.body;
