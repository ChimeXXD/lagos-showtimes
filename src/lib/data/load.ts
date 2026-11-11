import { readFileSync } from "node:fs";
import { join } from "node:path";
import registry from "../../../data/cinemas.json";
import type { ShowtimesFile } from "@/lib/data/types";

// Build-time only: pages read the files `npm run refresh` wrote (DATA §Per-area files). Each page
// loads its own file, so an area page carries only that area's showings (D-18).

export type Area = { slug: string; name: string; neighbours: string[]; cinemas: number };

/** Every area, with how many cinemas it has. */
export const areas: Area[] = registry.areas.map((area) => ({
  ...area,
  cinemas: registry.cinemas.filter((cinema) => cinema.area === area.slug).length,
}));

export function areaBySlug(slug: string): Area {
  const area = areas.find((candidate) => candidate.slug === slug);
  if (!area) throw new Error(`No area "${slug}" in data/cinemas.json`);
  return area;
}

function read(path: string): ShowtimesFile {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), "public/data", path), "utf8")) as ShowtimesFile;
  } catch (error) {
    throw new Error(`Cannot read public/data/${path}. Run \`npm run refresh -- --fixtures\` first. (${error instanceof Error ? error.message : String(error)})`);
  }
}

export const loadAll = () => read("all.json");
export const loadArea = (slug: string) => read(`area/${slug}.json`);
