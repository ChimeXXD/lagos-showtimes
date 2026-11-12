import type { Metadata } from "next";
import { FilmsBoard } from "@/components/FilmsBoard";
import { Shell } from "@/components/Shell";
import { loadAll } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";

export const metadata: Metadata = { title: "Films in Lagos · Sinima" };

/** Home: every film showing in Lagos, as posters. A visitor picks a film, then sees where it is on (D-55). */
export default function FilmsPage() {
  return (
    <Shell tab="films">
      <FilmsBoard data={toListData(loadAll())} />
    </Shell>
  );
}
