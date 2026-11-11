// logos.html: 20 logo drafts for Sinima, drawn in code on a 100 x 100 grid.
const ring = (n, radius, fn, start = -90) => Array.from({ length: n }, (_, i) => {
  const a = ((start + (i * 360) / n) * Math.PI) / 180;
  return fn(50 + radius * Math.cos(a), 50 + radius * Math.sin(a), i);
}).join("");
const f = (n) => n.toFixed(1);
const MARQUEE = [".####", "#....", "#....", ".###.", "....#", "....#", "####."];
const blob = `<path class="g" d="M26 80V54C26 34 36 22 50 22s24 12 24 32v26a8 8 0 0 1-8 8H34a8 8 0 0 1-8-8z"/><path class="gs" stroke-width="4" d="M42 24q-4-8 2-13M58 24q5-7-1-13"/>`;
const smile = `<path class="cs" stroke-width="4" d="M42 66q8 7 16 0"/>`;

const LOGOS = [
  ["Reel S", "An S made of film threading between two reels. The letter and the cinema in one stroke.",
    `<g transform="translate(7.5 7.5) scale(.85)"><path class="gs" stroke-width="11" d="M66 34A16 16 0 1 0 50 50A16 16 0 1 1 34 66"/><circle class="b" cx="50" cy="34" r="4.5"/><circle class="b" cx="50" cy="66" r="4.5"/></g>`],
  ["Screen face", "A cinema screen with two eyes glancing sideways: something is on, come and look.",
    `<rect class="g" x="16" y="27" width="68" height="46" rx="15"/><circle class="cut" cx="39" cy="50" r="9"/><circle class="cut" cx="62" cy="50" r="9"/><circle class="b" cx="42.5" cy="51" r="4.5"/><circle class="b" cx="65.5" cy="51" r="4.5"/>`],
  ["Curtains", "Two curtains parting, with one person in the light between them.",
    `<path class="g r" d="M18 20h28c0 30-11 46-28 60z"/><path class="g r" d="M82 20H54c0 30 11 46 28 60z"/><circle class="b" cx="50" cy="77" r="7"/>`],
  ["After the credits", "The credits rolling, then a gap, then one more line in blue: the scene worth staying for.",
    `<rect class="g" x="28" y="18" width="44" height="8" rx="4"/><rect class="g" x="36" y="31" width="28" height="8" rx="4"/><rect class="g" x="24" y="44" width="52" height="8" rx="4"/><rect class="g" x="33" y="57" width="34" height="8" rx="4"/><rect class="b" x="40" y="75" width="20" height="8" rx="4"/>`],
  ["Your seat", "One cinema seat, front on, with a blue cushion. Simple, bold and friendly.",
    `<rect class="g" x="28" y="16" width="44" height="46" rx="15"/><rect class="g" x="30" y="72" width="9" height="13" rx="4"/><rect class="g" x="61" y="72" width="9" height="13" rx="4"/><rect class="b cr" stroke-width="4" x="19" y="55" width="62" height="20" rx="10"/>`],
  ["Popcorn", "A popcorn bucket with one blue kernel. Warm, and it reads at any size.",
    `<circle class="g" cx="36" cy="42" r="10"/><circle class="g" cx="50" cy="33" r="12"/><circle class="b" cx="64" cy="42" r="10"/><path class="g r" d="M29 50h42l-5 32H34z"/><path class="cs" stroke-width="4" d="M43 54l2 26M57 54l-2 26"/>`],
  ["Marquee", "An S spelt out in the bulbs of a cinema sign.",
    MARQUEE.map((row, y) => [...row].map((c, x) => (c === "#" ? `<circle class="${y === 0 && x === 4 ? "b" : "g"}" cx="${30 + x * 10}" cy="${20 + y * 10}" r="3.9"/>` : "")).join("")).join("")],
  ["Wetin dey show?", "A speech bubble with a play mark: the question you ask a friend, answered.",
    `<path class="g r" d="M36 62l-6 20 22-20z"/><rect class="g" x="16" y="18" width="68" height="50" rx="18"/><path class="cut cr" d="M43 32l19 11-19 11z"/>`],
  ["Near me", "A map pin with a play mark inside: what is showing close to you.",
    `<path class="g" d="M50 88C33 67 23 55 23 42a27 27 0 0 1 54 0c0 13-10 25-27 46z"/><path class="cut cr" d="M43 31l18 11-18 11z"/>`],
  ["Reel", "A film reel with one window lit blue: the showing that is on now.",
    `<circle class="g" cx="50" cy="50" r="35"/>${ring(5, 19, (x, y, i) => `<circle class="${i === 0 ? "b" : "cut"}" cx="${f(x)}" cy="${f(y)}" r="7.5"/>`)}<circle class="cut" cx="50" cy="50" r="4"/>`],
  ["Film frame", "One frame of film with the picture lit up.",
    `<rect class="g" x="24" y="14" width="52" height="72" rx="11"/>${[28, 50, 72].map((y) => `<circle class="cut" cx="32.5" cy="${y}" r="3.2"/><circle class="cut" cx="67.5" cy="${y}" r="3.2"/>`).join("")}<rect class="b" x="40" y="30" width="20" height="40" rx="5"/>`],
  ["The character", "The doodle character from your drawings, looking straight out.",
    `${blob}<circle class="cut" cx="42" cy="52" r="4.8"/><circle class="cut" cx="58" cy="52" r="4.8"/>${smile}`],
  ["3D glasses", "The same character in cinema glasses, one lens blue.",
    `${blob}<path class="cs" stroke-width="4" d="M26 51h48"/><rect class="cut" x="29" y="43" width="19" height="16" rx="5"/><rect class="b cr" x="52" y="43" width="19" height="16" rx="5"/>${smile}`],
  ["Peeking", "The character leaning in from the corner, eyes up at the screen.",
    `<g transform="translate(14 30) scale(1.2)">${blob}<circle class="cut" cx="40" cy="48" r="6.5"/><circle class="cut" cx="57" cy="48" r="6.5"/><circle class="b" cx="38.5" cy="46" r="3"/><circle class="b" cx="55.5" cy="46" r="3"/></g>`],
  ["Two eyes", "The word itself: the dots of the two i's are blue, like a pair of eyes watching.",
    `<text class="word" x="50" y="59" text-anchor="middle" data-word>sınıma</text>`],
  ["Route", "An S-shaped road from you to the cinema, the blue dot.",
    `<path class="gs" stroke-width="8" d="M68 27C38 18 26 42 50 50S62 82 32 73"/><circle class="b cr" cx="69" cy="27" r="9"/><circle class="g cr" cx="31" cy="73" r="9"/>`],
  ["Action", "A clapperboard snapping shut, its arm in blue: the film is starting.",
    `<rect class="g" x="19" y="44" width="62" height="40" rx="11"/><rect class="b" x="19" y="24" width="62" height="13" rx="6.5" transform="rotate(-13 22 37)"/>`],
  ["Lagoon", "A Lagos bridge over the lagoon with the evening sun in blue.",
    `<circle class="b" cx="66" cy="30" r="13"/><path class="gs" stroke-width="8" d="M14 56h72M20 84a15 15 0 0 1 30 0a15 15 0 0 1 30 0"/>`],
  ["Stay or Go", "Two half circles slipped apart. Together they make an S; apart they are the choice: stay, or go.",
    `<path class="g" d="M48 17A27 27 0 0 0 48 71Z"/><path class="b" d="M52 29A27 27 0 0 1 52 83Z"/>`],
  ["Starting soon", "Twelve dots round a clock face, growing as the start gets close. The last one is blue.",
    ring(12, 31, (x, y, i) => `<circle class="${i === 11 ? "b" : "g"}" cx="${f(x)}" cy="${f(y)}" r="${f(2.2 + i * 0.48)}"/>`, -60)],
].map(([name, say, svg], i) => ({ id: String(i + 1), name, say, svg }));

const KEY = "sinima-logo-shortlist";
const tile = (l, size, cls = "") => `<span class="tile ${cls}" style="width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.23)}px" data-testid="logo.${l.id}.tile${size}${cls}"><svg viewBox="0 0 100 100" aria-hidden="true">${l.svg}</svg></span>`;

document.getElementById("logos").innerHTML = LOGOS.map((l) => `<article class="logo-card" data-id="${l.id}" data-testid="logo.${l.id}">
  <h2 class="logo-name" data-testid="logo.${l.id}.name">${l.id} · ${l.name}</h2>
  <div class="logo-row">
    ${tile(l, 116)}${tile(l, 116, "light")}
  </div>
  <div class="logo-row">
    <div class="logo-home">${tile(l, 60)}<span data-testid="logo.${l.id}.label">Sinima</span></div>
    <div class="logo-tab">${tile(l, 16)}<span data-testid="logo.${l.id}.tab">Sinima</span></div>
  </div>
  <p class="logo-say" data-testid="logo.${l.id}.say">${l.say}</p>
  <button class="logo-pick" type="button" aria-pressed="false" data-pick="${l.id}" data-testid="logo.${l.id}.pick">Shortlist</button>
</article>`).join("");

// "Two eyes": put a blue dot over each dotless i, once the font has loaded and letters can be measured.
document.fonts.ready.then(() => {
  document.querySelectorAll("[data-word]").forEach((t) => {
    for (const i of [1, 3]) {
      const box = t.getExtentOfChar(i);
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "b");
      dot.setAttribute("cx", String(box.x + box.width / 2));
      dot.setAttribute("cy", "37.5");
      dot.setAttribute("r", "3.6");
      t.after(dot);
    }
  });
});

const note = document.getElementById("logos-note");
const picked = document.getElementById("logos-picked");
const statusLine = document.getElementById("logos-status");
const choice = { ids: [], note: "" };
const label = () => choice.ids.map((id) => `${id} · ${LOGOS[Number(id) - 1].name}`).join(", ");
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* private window: the shortlist still works until the page closes */ }
}
function show() {
  document.querySelectorAll(".logo-card").forEach((c) => {
    const on = choice.ids.includes(c.dataset.id);
    c.dataset.picked = String(on);
    c.querySelector(".logo-pick").setAttribute("aria-pressed", String(on));
    c.querySelector(".logo-pick").textContent = on ? "Shortlisted" : "Shortlist";
  });
  picked.textContent = label() || "Nothing yet";
  statusLine.textContent = choice.ids.length ? "Saved in this browser." : "Press \"Shortlist\" on the ones you like.";
}
try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
  if (saved && Array.isArray(saved.ids)) { choice.ids = saved.ids.map(String).filter((id) => LOGOS[Number(id) - 1]); choice.note = String(saved.note ?? ""); }
} catch { /* nothing saved, or storage is blocked */ }
note.value = choice.note;
show();

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-pick]");
  if (!b) return;
  const id = b.dataset.pick;
  choice.ids = choice.ids.includes(id) ? choice.ids.filter((x) => x !== id) : [...choice.ids, id].sort((a, c) => a - c);
  save(); show();
});
note.addEventListener("input", () => { choice.note = note.value; save(); });
document.getElementById("logos-copy").addEventListener("click", async () => {
  if (!choice.ids.length && !choice.note.trim()) { statusLine.textContent = "Shortlist at least one, or write a note."; return; }
  const text = `Logos: ${label() || "none"} | Note: ${choice.note.trim() || "none"}`;
  try { await navigator.clipboard.writeText(text); statusLine.textContent = "Copied. Paste it to Claude."; } catch { statusLine.textContent = `Copy this: ${text}`; }
});
