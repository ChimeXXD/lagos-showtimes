// art.html: three drawing styles (same scene: empty seats, a screen) and six icon drafts, all drawn in code.
const STYLES = [
  { id: "1", name: "1 · Line", ref: "ref-line", refAlt: "Pinterest results for minimal black and white line illustrations for empty states",
    say: "Thin, even outlines with one solid black shape. Quiet and tidy, like the drawing on Uber's empty screen that you liked. The lightest to load.",
    svg: `<rect class="ink" x="44" y="14" width="152" height="66" rx="8"/><circle class="ink" cx="120" cy="47" r="15"/><path class="ink" d="M120 38v9l7 5"/>
      <path class="ink" d="M30 142h180"/>
      <rect class="ink" x="52" y="100" width="36" height="34" rx="9"/><rect class="ink-fill" x="102" y="100" width="36" height="34" rx="9"/><rect class="ink" x="152" y="100" width="36" height="34" rx="9"/>
      <path class="ink" d="M46 118v16M94 118v16M144 118v16M194 118v16"/>` },
  { id: "2", name: "2 · Bold shapes", ref: "ref-shapes", refAlt: "Pinterest results for flat geometric poster illustrations with bold shapes",
    say: "Solid blocks, no outlines, with the Book blue as the one colour. Feels like a film poster. The strongest personality, and it suits the black capsules.",
    svg: `<rect class="soft" x="34" y="12" width="172" height="84" rx="10"/><circle class="blue" cx="150" cy="78" r="40"/>
      <rect class="ink-fill" x="38" y="96" width="48" height="52" rx="16"/><rect class="ink-fill" x="96" y="96" width="48" height="52" rx="16"/><rect class="ink-fill" x="154" y="96" width="48" height="52" rx="16"/>
      <rect class="ink-fill" x="26" y="138" width="188" height="14" rx="7"/>` },
  { id: "3", name: "3 · Doodle", ref: "ref-doodle", refAlt: "Pinterest results for hand-drawn black and white doodle characters",
    say: "A hand-drawn little character with popcorn, waiting. The warmest and most playful. It needs a character people recognise across screens, so it is the most work to keep consistent.",
    svg: `<path class="ink" d="M84 136c-4-34 8-62 33-62s36 28 31 62"/><circle class="ink-fill" cx="108" cy="98" r="2.8"/><circle class="ink-fill" cx="127" cy="98" r="2.8"/><path class="ink" d="M110 109q8 7 15 0"/>
      <path class="ink" d="M96 76q-3-12 6-16M136 76q4-10-3-17"/>
      <path class="ink" d="M150 112l5 26h20l5-26z"/><path class="ink" d="M158 112l2 26M172 112l-2 26"/><path class="ink" d="M152 110q2-9 9-5q3-9 10-2q8-4 8 7"/>
      <path class="ink" d="M146 118q-10 4-14 12"/>
      <path class="ink" d="M40 140q10-5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0"/>
      <path class="ink" d="M52 60v10M47 65h10M190 40v8M186 44h8"/>` },
];

const tile = `<rect class="ic-tile" width="100" height="100" rx="23"/>`;
const ICONS = [
  { id: "1", name: "1 · Letter", say: "The S from the wordmark. The simplest, and it matches the name at once.",
    svg: `${tile}<text class="ic-letter" x="50" y="73" text-anchor="middle">S</text>` },
  { id: "2", name: "2 · Two capsules", say: "Two capsules, offset, that read as an S. Built from the same shape as the buttons.",
    svg: `${tile}<rect class="ic-glyph" x="32" y="24" width="46" height="22" rx="11"/><rect class="ic-glyph" x="22" y="54" width="46" height="22" rx="11"/>` },
  { id: "3", name: "3 · Ticket", say: "A ticket with a play mark. Says cinema straight away.",
    svg: `${tile}<path class="ic-glyph" d="M20 34a8 8 0 0 1 8-8h44a8 8 0 0 1 8 8v8a8 8 0 0 0 0 16v8a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8v-8a8 8 0 0 0 0-16z"/><path class="ic-cut" d="M43 38l19 12-19 12z"/>` },
  { id: "4", name: "4 · Starting soon", say: "A countdown ring closing around a play mark: the film is about to start.",
    svg: `${tile}<circle class="ic-line" cx="50" cy="50" r="27" stroke-dasharray="127 170" transform="rotate(-90 50 50)"/><path class="ic-glyph" d="M43 37l20 13-20 13z"/>` },
  { id: "5", name: "5 · Your seat", say: "A screen and a row of seats, one of them blue: yours.",
    svg: `${tile}<rect class="ic-glyph" x="20" y="24" width="60" height="30" rx="7"/><circle class="ic-glyph" cx="30" cy="72" r="8"/><circle class="ic-blue" cx="50" cy="72" r="8"/><circle class="ic-glyph" cx="70" cy="72" r="8"/>` },
  { id: "6", name: "6 · Projector beam", say: "A lens throwing a beam of light across the dark.",
    svg: `${tile}<path class="ic-glyph" d="M34 50L82 24v52z" opacity=".55"/><circle class="ic-glyph" cx="30" cy="50" r="11"/>` },
];

// Second round: icons made from the doodle character Chime picked (D-39).
const blob = `<path class="ic-glyph" d="M24 100V58C24 36 35 23 50 23s26 13 26 35v42z"/><path class="ic-tuft" d="M41 26q-4-9 2-14M59 26q5-8-1-14"/>`;
const smile = `<path class="ic-ink" d="M43 66q7 6 14 0"/>`;
const NEW_ICONS = [
  { id: "7", name: "7 · The face", say: "The doodle character looking out. Friendly, and it ties the icon to the drawings.",
    svg: `${tile}${blob}<circle class="ic-cut" cx="42" cy="53" r="4"/><circle class="ic-cut" cx="58" cy="53" r="4"/>${smile}` },
  { id: "8", name: "8 · 3D glasses", say: "The character in cinema glasses, one lens in the Book blue. The most \"film\" of the four.",
    svg: `${tile}${blob}<path class="ic-ink" d="M24 51h8M68 51h8M48 51h4"/><rect class="ic-cut" x="30" y="44" width="18" height="14" rx="4"/><rect class="ic-lens" x="52" y="44" width="18" height="14" rx="4"/>${smile}` },
  { id: "9", name: "9 · In the seat", say: "The character peeking over a blue cinema seat, waiting for the film.",
    svg: `${tile}<g transform="translate(0 -6)">${blob}<circle class="ic-cut" cx="42" cy="50" r="4"/><circle class="ic-cut" cx="58" cy="50" r="4"/></g><rect class="ic-blue" x="14" y="62" width="72" height="44" rx="14"/>` },
  { id: "10", name: "10 · Line on white", say: "The same face as a black line drawing on white, closest to how the drawings look on the page.",
    svg: `<rect class="ic-paper" x="1" y="1" width="98" height="98" rx="22"/><path class="ic-ink ic-thick" d="M26 99V58C26 37 36 25 50 25s24 12 24 33v41"/><path class="ic-ink" d="M41 27q-4-9 2-14M59 27q5-8-1-14"/><circle class="ic-cut" cx="42" cy="54" r="4"/><circle class="ic-cut" cx="58" cy="54" r="4"/>${smile}` },
];

const KEY = "sinima-art-pick";
const icon = (i, size) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" data-testid="art.icon.${i.id}.at${size}">${i.svg}</svg>`;

document.getElementById("styles").innerHTML = STYLES.map((s) => `<article class="art-style" data-testid="art.style.${s.id}">
  <h3 class="art-name" data-testid="art.style.${s.id}.name">${s.name}</h3>
  <p class="art-say" data-testid="art.style.${s.id}.say">${s.say}</p>
  <div class="art-frame">
    <svg viewBox="0 0 240 160" role="img" aria-label="Empty cinema seats in front of a screen, drawn in style ${s.id}" data-testid="art.style.${s.id}.drawing">${s.svg}</svg>
    <p class="art-head" data-testid="art.style.${s.id}.head">Nothing starts in the next 2 hours in Lekki.</p>
    <p class="art-sub" data-testid="art.style.${s.id}.sub">Here's later tonight.</p>
    <span class="art-cta" data-testid="art.style.${s.id}.cta">See later tonight</span>
  </div>
  <figure class="art-ref">
    <figcaption data-testid="art.style.${s.id}.ref.caption">Reference, from Pinterest</figcaption>
    <img src="images/${s.ref}.jpg" alt="${s.refAlt}" loading="lazy" data-testid="art.style.${s.id}.ref.image">
  </figure>
</article>`).join("");

const iconCard = (i) => `<article class="art-icon" data-testid="art.icon.${i.id}">
  <h3 class="art-name" data-testid="art.icon.${i.id}.name">${i.name}</h3>
  <div class="art-sizes">
    ${icon(i, 120)}
    <div class="art-home">${icon(i, 60)}<span data-testid="art.icon.${i.id}.label">Sinima</span></div>
    <div class="art-tab">${icon(i, 16)}<span data-testid="art.icon.${i.id}.tab">Sinima</span></div>
  </div>
  <p class="art-say" data-testid="art.icon.${i.id}.say">${i.say}</p>
</article>`;
document.getElementById("icons-new").innerHTML = NEW_ICONS.map(iconCard).join("");
document.getElementById("icons").innerHTML = ICONS.map(iconCard).join("");

const buttons = (list, kind) => list.map((x) => `<button type="button" data-kind="${kind}" data-value="${x.name}" aria-pressed="false" data-testid="art.pick.${kind}.${x.id}">${x.id}</button>`).join("");
document.getElementById("style-buttons").innerHTML = buttons(STYLES, "style");
document.getElementById("icon-buttons").innerHTML = buttons([...NEW_ICONS, ...ICONS], "icon");

const note = document.getElementById("art-note");
const statusLine = document.getElementById("art-status");
const choice = { style: "", icon: "", note: "" };
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* private window: the pick still works until the page closes */ }
}
function show() {
  document.querySelectorAll("[data-kind]").forEach((b) => b.setAttribute("aria-pressed", String(choice[b.dataset.kind] === b.dataset.value)));
  statusLine.textContent = choice.style || choice.icon ? `Style: ${choice.style || "not chosen"}. Icon: ${choice.icon || "not chosen"}.` : "Choose a style and an icon.";
}
try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
  if (saved && typeof saved === "object") for (const k of Object.keys(choice)) choice[k] = String(saved[k] ?? "");
} catch { /* nothing saved, or storage is blocked */ }
note.value = choice.note;
show();

document.querySelectorAll("[data-kind]").forEach((b) => b.addEventListener("click", () => { choice[b.dataset.kind] = b.dataset.value; save(); show(); }));
note.addEventListener("input", () => { choice.note = note.value; save(); });
document.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => {
  document.documentElement.dataset.theme = b.dataset.themeSet;
  b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
}));
document.getElementById("art-copy").addEventListener("click", async () => {
  if (!choice.style && !choice.icon) { statusLine.textContent = "Choose a style and an icon first."; return; }
  const text = `Style: ${choice.style || "not chosen"} | Icon: ${choice.icon || "not chosen"} | Note: ${choice.note.trim() || "none"}`;
  try { await navigator.clipboard.writeText(text); statusLine.textContent = "Copied. Paste it to Claude."; } catch { statusLine.textContent = `Copy this: ${text}`; }
});
