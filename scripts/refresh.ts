// Refresh showtimes: run sources -> normalise -> validate -> write data/showtimes.json.
// Day 0 stub. The pipeline is built on Day 2 (docs/PLAN.md). Until then this only reports
// which sources are cleared (D-08) and exits non-zero so nothing mistakes it for a real run.
import { readFileSync } from "node:fs";
import { join } from "node:path";

type SourceEntry = { id: string; status: string };

const registry = JSON.parse(
  readFileSync(join(import.meta.dirname, "..", "data", "sources.json"), "utf8"),
) as { sources: SourceEntry[] };

const cleared = registry.sources.filter((s) => s.status === "cleared").map((s) => s.id);
console.log(`Cleared sources: ${cleared.length > 0 ? cleared.join(", ") : "none"}`);
console.error("refresh is not built yet (Day 2). Nothing was fetched or written.");
process.exit(1);
