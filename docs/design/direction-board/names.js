// names.html: name options (Sinima and nine that are not built on it), each shown in the header, a share message and a home-screen label.
const NAMES = [
  ["Sinima", "How \"cinema\" is said and spelt in Yoruba and Hausa. The one you already like, here to compare."],
  ["Majigi", "Hausa for a film show or cinema. One word, easy to say, and not used much outside the north."],
  ["Nkiri", "Igbo, from \"ihe nkiri\": something to watch, a show."],
  ["Fiimu", "Yoruba for \"film\". As plain as Sinima, and it names the film, not the building."],
  ["Oya", "\"Let's go\" or \"come on\". The word that gets people out of the house."],
  ["No Dull", "Pidgin for \"don't sleep on it, don't miss out\". Fits a site about what starts soon."],
  ["Sharp Sharp", "\"Quickly, right now.\" What you want when a film starts in 15 minutes."],
  ["E Don Start?", "Pidgin for \"has it started?\". The worry the site settles."],
  ["Abeg Wait", "Pidgin for \"please wait\". A nod to Stay or Go: don't leave before the scene after the credits."],
  ["Gidi Reel", "\"Las Gidi\", the street name for Lagos, plus a film reel. The only one that says Lagos."],
];
const KEY = "lagos-showtimes-name-pick";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "own";

const card = (name, means) => `<article class="name-card" data-name="${esc(name)}" data-testid="name.${slug(name)}">
  <div class="name-head"><span class="name-mark" data-testid="name.${slug(name)}.mark">${esc(name)}</span><span class="name-area" data-testid="name.${slug(name)}.area">Lekki ▾</span></div>
  ${means ? `<p class="name-means" data-testid="name.${slug(name)}.means">${esc(means)}</p>` : ""}
  <ul class="name-uses">
    <li class="name-use"><span data-testid="name.${slug(name)}.share.label">WhatsApp share</span><span class="name-share" data-testid="name.${slug(name)}.share">Clayface · Filmhouse Lekki IMAX · Fri 19:00<br><b>${esc(name)}</b></span></li>
    <li class="name-use"><span data-testid="name.${slug(name)}.home.label">Home screen</span><span class="name-home"><span class="name-tile" aria-hidden="true" data-testid="name.${slug(name)}.tile">${esc(name.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase())}</span><span class="name-label" data-testid="name.${slug(name)}.home">${esc(name)}</span></span></li>
  </ul>
  <button class="name-pick" type="button" aria-pressed="false" data-pick="${esc(name)}" data-testid="name.${slug(name)}.pick">Pick this</button>
</article>`;

const list = document.getElementById("names");
const own = document.getElementById("names-own");
const input = document.getElementById("names-note");
const picked = document.getElementById("names-picked");
const statusLine = document.getElementById("names-status");
const choice = { name: "", own: "" };

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* private window: the pick still works until the page closes */ }
}
function show() {
  own.innerHTML = choice.own.trim() ? card(choice.own.trim(), "") : "";
  document.querySelectorAll(".name-card").forEach((c) => {
    const on = c.dataset.name === choice.name;
    c.dataset.picked = String(on);
    c.querySelector(".name-pick").setAttribute("aria-pressed", String(on));
  });
  picked.textContent = choice.name || "Nothing yet";
  statusLine.textContent = choice.name ? "Saved in this browser." : "Press \"Pick this\" on a card.";
}

list.innerHTML = NAMES.map(([n, m]) => card(n, m)).join("");
try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
  if (saved && typeof saved === "object") Object.assign(choice, { name: String(saved.name ?? ""), own: String(saved.own ?? "") });
} catch { /* nothing saved, or storage is blocked */ }
input.value = choice.own;
show();

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-pick]");
  if (b) { choice.name = b.dataset.pick; save(); show(); }
});
input.addEventListener("input", () => {
  // A typed name that was picked stops being the pick once it is edited.
  if (choice.name === choice.own.trim() && !NAMES.some(([n]) => n === choice.name)) choice.name = "";
  choice.own = input.value; save(); show();
});
document.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => {
  document.documentElement.dataset.theme = b.dataset.themeSet;
  b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
}));
document.getElementById("names-copy").addEventListener("click", async () => {
  if (!choice.name) { statusLine.textContent = "Press \"Pick this\" on a card first."; return; }
  const text = `Name: ${choice.name}`;
  try { await navigator.clipboard.writeText(text); statusLine.textContent = "Copied. Paste it to Claude."; } catch { statusLine.textContent = `Copy this: ${text}`; }
});
