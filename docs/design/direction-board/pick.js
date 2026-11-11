// pick.html: remembers the chosen direction, name and note in this browser, and copies them as one line.
const KEY = "lagos-showtimes-direction-pick";
const note = document.getElementById("pick-note");
const statusLine = document.getElementById("pick-status");
const choice = { direction: "", name: "Lagos Showtimes", note: "" };

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* private window: the pick still works until the page closes */ }
}
function show() {
  document.querySelectorAll("[data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pick === choice.direction)));
  statusLine.textContent = choice.direction ? `${choice.direction}, named ${choice.name}. Saved in this browser.` : "Choose a direction first.";
}

try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
  if (saved && typeof saved === "object") Object.assign(choice, { direction: String(saved.direction ?? ""), name: String(saved.name ?? choice.name), note: String(saved.note ?? "") });
} catch { /* nothing saved, or storage is blocked */ }
note.value = choice.note;
// board.js owns the name buttons; pressing the saved one puts that name in every header.
document.querySelector(`[data-name-set="${CSS.escape(choice.name)}"]`)?.click();
show();

document.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => { choice.direction = b.dataset.pick; save(); show(); }));
document.querySelectorAll("[data-name-set]").forEach((b) => b.addEventListener("click", () => { choice.name = b.dataset.nameSet; save(); show(); }));
note.addEventListener("input", () => { choice.note = note.value; save(); });

document.getElementById("pick-copy").addEventListener("click", async () => {
  if (!choice.direction) { statusLine.textContent = "Choose a direction first."; return; }
  const text = `Direction: ${choice.direction} | Name: ${choice.name} | Note: ${choice.note.trim() || "none"}`;
  try {
    await navigator.clipboard.writeText(text);
    statusLine.textContent = "Copied. Paste it to Claude.";
  } catch {
    statusLine.textContent = `Copy this: ${text}`;
  }
});
