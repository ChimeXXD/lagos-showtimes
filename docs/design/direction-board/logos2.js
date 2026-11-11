// logos2.html: the shortlisted logo plus six new ones, each in its colour sets.
// A colour set is [name, background, mark, accent]. For mascots it is [name, body, feature, background] and an image.
const NIGHT = ["Marigold night", "#1e2657", "#f6efdd", "#e9a93c"];
const CREAM = ["Tomato and cream", "#f7eedc", "#2a1a14", "#d8412f"];
const PALM = ["Palm", "#0f3b2e", "#eaf4e4", "#d9e86a"];
const dots = (rows) => rows.map(([y, xs, accent]) => xs.map((x) => `<circle class="${x === accent ? "a" : "m"}" cx="${x}" cy="${(y - 5 * ((x - 50) / 32) ** 2).toFixed(1)}" r="6.3"/>`).join("")).join("");

const LOGOS = [
  { n: 0, name: "Screen face", by: "Shortlisted from round one", idea: "A cinema screen with two eyes glancing sideways. Full presentation on the identity page.",
    svg: `<rect class="m" x="16" y="27" width="68" height="46" rx="15"/><circle class="cut" cx="39" cy="50" r="9"/><circle class="cut" cx="62" cy="50" r="9"/><circle class="a" cx="42.5" cy="51" r="4.5"/><circle class="a" cx="65.5" cy="51" r="4.5"/>`,
    ways: [["Ink and blue", "#0a0a0a", "#ffffff", "#8fb4f5"]] },
  { n: 1, name: "The owl", by: "Mascot skill · Figma AI", img: "owl", idea: "Lagos goes to the cinema at night. A baby owl with huge eyes: awake late, watching everything.",
    prompt: "A very simple, cute baby owl peeking in from the lower-left corner: one rounded shape, two very large round eye discs, deep navy body, warm cream eyes and belly, on a solid marigold background. No text, no outlines, no detail.",
    ways: [["Marigold night", "#1a2c50", "#fbf0d7", "#f4bc3c"], ["Palm", "#0f3b2e", "#eaf4e4", "#d9e86a"], ["Wine and coral", "#7a2233", "#ffe9d6", "#f08a6c"]] },
  { n: 2, name: "The agama", by: "Mascot skill · Figma AI", img: "agama", idea: "The orange-headed wall lizard every Lagosian knows, nodding on a fence and watching the street. Unmistakably local.",
    prompt: "A very simple, cute baby agama lizard peeking in from the lower-left corner: a big round orange head on a rounded cobalt blue body, two simple eyes, on a solid sand-cream background. No text, no scales, no outlines.",
    ways: [["Agama", "#144bc9", "#fc8227", "#f1e7cf"], ["Marigold night", "#1e2657", "#e9a93c", "#f6efdd"], ["Palm", "#0f3b2e", "#d9e86a", "#eaf4e4"]] },
  { n: 3, name: "The popcorn", by: "Mascot skill · Figma AI", img: "popcorn", idea: "The friendliest thing in any cinema. A puffy popcorn head in a plain tub, smiling up from the corner.",
    prompt: "A very simple, cute popcorn character peeking in from the lower-left corner: a puffy butter-cream cloud head in a plain tomato-red tub, two simple eyes and a tiny mouth, on a solid muted teal background. No text, no stripes, no outlines.",
    ways: [["Tomato and teal", "#ed4440", "#fceec5", "#5c9e8b"], ["Marigold night", "#1e2657", "#f6efdd", "#e9a93c"], ["Ink and blue", "#2f5fb3", "#ffffff", "#0a0a0a"]] },
  { n: 4, name: "Ticket S", by: "Logo skill · design prompt", idea: "A cinema ticket with two bites taken out of it, one high on the right and one low on the left, so the ticket itself becomes an S.",
    prompt: "One solid rounded ticket shape. Subtract two round notches, upper right and lower left, so the silhouette reads as the letter S. Three small dots across the middle as the tear line, in the accent colour: \"there is more to come\". One element, generous empty space, rounded cuts only, must read at 16 px.",
    svg: `<rect class="m" x="20" y="13" width="60" height="74" rx="17"/><circle class="cut" cx="80" cy="36" r="12.5"/><circle class="cut" cx="20" cy="64" r="12.5"/><circle class="a" cx="38" cy="50" r="3.8"/><circle class="a" cx="50" cy="50" r="3.8"/><circle class="a" cx="62" cy="50" r="3.8"/>`,
    ways: [NIGHT, CREAM, PALM] },
  { n: 5, name: "Front row", by: "Logo skill · design prompt", idea: "You, seen from behind, in front of the screen. It also reads as the sun going down: the moment the evening shows begin.",
    prompt: "Two shapes only. A wide rounded rectangle for the screen, and one half circle rising from its bottom edge in the accent colour: a head in the front row, or a setting sun. Bold, flat, no outline, asymmetry from the colour alone, must read at 16 px.",
    svg: `<rect class="m" x="11" y="19" width="78" height="62" rx="19"/><path class="a" d="M27 81A23 23 0 0 1 73 81Z"/>`,
    ways: [NIGHT, CREAM, PALM] },
  { n: 6, name: "Seat map", by: "Logo skill · design prompt", idea: "The seating plan you see when you book: the screen at the top, rows of seats curving toward it, and one seat in colour. Yours.",
    prompt: "A dot-matrix mark. One short capsule for the screen, then three rows of round dots (three, four, five) that curve gently toward it. Exactly one dot in the accent colour, off centre. Even spacing, nothing else, must read at 16 px.",
    svg: `<rect class="m" x="24" y="12" width="52" height="10" rx="5"/>${dots([[43, [34, 50, 66]], [61, [26, 42, 58, 74], 58], [79, [18, 34, 50, 66, 82]]])}`,
    ways: [NIGHT, CREAM, PALM] },
];

const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
const edge = (h) => (lum(h) > 0.8 ? " edge" : "");

function way(l, [name, c1, c2, c3], i) {
  const id = `${l.n}-${i}`;
  // Mascots: the panel takes the body colour and the word the feature colour. Marks: background, mark, accent.
  const [bg, fg, ac] = [c1, c2, c3];
  const art = l.img ? `<img src="../logo/mascots/${l.img}-${"abc"[i]}.webp" alt="">` : `<svg viewBox="0 0 100 100" aria-hidden="true">${l.svg}</svg>`;
  const tile = (s) => `<span class="tile${l.img ? "" : edge(bg)}" style="--s:${s}px">${art}</span>`;
  // How the app could use the set: lightest as the page, darkest as text, the third as the Book button.
  const [light, mid, dark] = [c1, c2, c3].sort((a, b) => lum(b) - lum(a));
  const btnFg = contrast(mid, dark) >= contrast(mid, light) ? dark : light;
  const roles = l.img ? ["Mascot body", "Mascot face", "Background"] : ["Background", "Mark", "Accent"];
  return `<div class="way" data-id="${id}" style="--p-bg:${bg};--p-fg:${fg};--p-ac:${ac};--u-bg:${light};--u-fg:${dark};--u-btn:${mid};--u-btn-fg:${btnFg}">
    <figure class="panel${edge(bg)}"><div class="lockup">${l.img ? art : `<svg viewBox="0 0 100 100" aria-hidden="true">${l.svg}</svg>`}<span class="word">Sinima</span></div><figcaption class="panel-cap">${name}</figcaption></figure>
    <div class="detail"><div class="sizes">${tile(64)}${tile(32)}${tile(16)}</div>
      <ul class="swatches">${[c1, c2, c3].map((c, k) => `<li><i style="background:${c}"></i><code>${c.toUpperCase()}</code>${roles[k]}</li>`).join("")}</ul></div>
    <div class="ui${edge(light)}"><div><p class="ui-time">19:30</p><p class="ui-film">Clayface · in the app</p></div><span class="ui-book">Book</span></div>
    <button class="pick" type="button" aria-pressed="false" data-pick="${id}" data-label="${l.n === 0 ? "Shortlisted" : `Logo ${l.n}`} · ${l.name}, colours: ${name}">Pick this</button>
  </div>`;
}

document.getElementById("logos").innerHTML = LOGOS.map((l) => `<section class="logo">
  <div class="logo-head"><div><p class="eyebrow">${l.n === 0 ? "Shortlisted" : `Logo ${l.n}`} · ${l.by}</p><h2>${l.name}</h2><p class="logo-idea">${l.idea}</p></div></div>
  <div class="ways">${l.ways.map((w, i) => way(l, w, i)).join("")}</div>
  ${l.prompt ? `<div class="prompt"><p class="eyebrow">${l.img ? "Image prompt, in short" : "Design prompt"}</p><p>${l.prompt}</p></div>` : ""}
</section>`).join("");

const KEY = "sinima-logo-round2";
const note = document.getElementById("note");
const picked = document.getElementById("picked");
const statusLine = document.getElementById("status");
const choice = { id: "", label: "", note: "" };
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* private window: the pick still works until the page closes */ }
}
function show() {
  document.querySelectorAll(".way").forEach((w) => {
    const on = w.dataset.id === choice.id;
    w.dataset.picked = String(on);
    w.querySelector(".pick").setAttribute("aria-pressed", String(on));
  });
  picked.textContent = choice.label || "Nothing yet";
  statusLine.textContent = choice.id ? "Saved in this browser." : "Press \"Pick this\" under a colour set.";
}
try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
  if (saved && typeof saved === "object") for (const k of Object.keys(choice)) choice[k] = String(saved[k] ?? "");
} catch { /* nothing saved, or storage is blocked */ }
note.value = choice.note;
show();
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-pick]");
  if (!b) return;
  choice.id = b.dataset.pick; choice.label = b.dataset.label; save(); show();
});
note.addEventListener("input", () => { choice.note = note.value; save(); });
document.getElementById("copy").addEventListener("click", async () => {
  if (!choice.id && !choice.note.trim()) { statusLine.textContent = "Pick one, or write a note."; return; }
  const text = `${choice.label || "No pick"} | Note: ${choice.note.trim() || "none"}`;
  try { await navigator.clipboard.writeText(text); statusLine.textContent = "Copied. Paste it to Claude."; } catch { statusLine.textContent = `Copy this: ${text}`; }
});
