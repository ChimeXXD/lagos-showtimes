import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { YoursBoard } from "@/components/YoursBoard";
import { areas, loadAll } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";

export const metadata: Metadata = { title: "Your cinemas · Sinima" };

/** The Your cinemas tab (D-61): the cinemas this visitor has hearted, kept on their phone only. */
export default function YoursPage() {
  return (
    <Shell tab="yours">
      <YoursBoard data={toListData(loadAll())} areas={areas} />
    </Shell>
  );
}
