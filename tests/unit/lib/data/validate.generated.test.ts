import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateShowtimes } from "@/lib/data/validate";

// The files `npm run refresh` last wrote, when there are any (they are not committed while the
// site runs on sample data, D-45). Older files may log showings that have since ended; they must
// still be sound.
const root = join(import.meta.dirname, "../../../..");
const areaDir = join(root, "public/data/area");
const paths = [
  join(root, "data/showtimes.json"),
  join(root, "public/data/all.json"),
  ...(existsSync(areaDir) ? readdirSync(areaDir).map((name) => join(areaDir, name)) : []),
].filter((path) => existsSync(path));

describe.skipIf(paths.length === 0)("the data files on disk", () => {
  it.each(paths.map((path) => [path.slice(root.length + 1), path]))("%s validates", (_, path) => {
    const result = validateShowtimes(JSON.parse(readFileSync(path, "utf8")));
    expect(result.ok ? [] : result.errors).toEqual([]);
  });
});
