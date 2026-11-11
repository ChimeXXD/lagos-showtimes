import type { CreditsInfo, CreditsSource } from "@/lib/data/types";
import { toLagos, utcMs } from "@/lib/time/lagos";

// The only place Stay or Go sentences are written (D-10, D-19, DATA §Credits wording).
// A missing answer is "not known yet", never "Go".

export type CreditsVerdict = "stay" | "probably-stay" | "go" | "unknown";
export type CreditsWording = { verdict: CreditsVerdict; chip: string; detail: string };

const NOT_KNOWN: CreditsWording = { verdict: "unknown", chip: "Credits scene: not known yet", detail: "No source has told us yet." };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const names = (sources: CreditsSource[]) => sources.map((s) => s.name);
/** "TMDB", "TMDB and RunPee", "TMDB, RunPee and aftercredits.com" */
function list(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}
/** A source we can point to: a name, an https link and the day it was checked. */
function citable(s: CreditsSource): boolean {
  if (s.name.trim() === "" || !s.url.startsWith("https://")) return false;
  try {
    utcMs(s.checkedAt);
    return true;
  } catch {
    return false; // no usable "checked" date: not enough to say Go
  }
}

export function creditsWording(credits: CreditsInfo): CreditsWording {
  const { during, after, confidence, sources } = credits;
  const named = sources.filter((s) => s.name.trim() !== "");
  const confirmed = confidence === "confirmed" && named.length > 0;
  const who = list(names(named));
  const verb = named.length === 1 ? "lists" : "list";

  if (confirmed && during === "yes" && after === "yes") {
    return { verdict: "stay", chip: "Stay: scenes during and after the credits", detail: `${who} ${verb} scenes during and after the credits.` };
  }
  if (confirmed && after === "yes") {
    return { verdict: "stay", chip: `Stay: scene after the credits · ${names(named).join(", ")}`, detail: `${who} ${verb} an after-credits scene.` };
  }
  if (confirmed && during === "yes") {
    return { verdict: "stay", chip: "Stay a little: scene during the credits", detail: `${who} ${verb} a scene during the credits.` };
  }
  if (after === "yes" && confidence === "likely") {
    return { verdict: "probably-stay", chip: "Probably stay: scene after the credits", detail: "A guess: no source has confirmed it yet." };
  }
  if (confidence === "confirmed" && during === "no" && after === "no") {
    const source = sources.find(citable);
    if (source) {
      const checked = toLagos(source.checkedAt);
      return { verdict: "go", chip: "Go: nothing after the credits", detail: `Per ${source.name}, checked ${checked.day} ${MONTHS[checked.month - 1]}.` };
    }
  }
  return NOT_KNOWN;
}
