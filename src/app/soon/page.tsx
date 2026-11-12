import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { SoonBoard } from "@/components/SoonBoard";
import { areas, loadAll } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";

export const metadata: Metadata = { title: "Starting soon in Lagos · Sinima" };

/** What starts in the next 2 hours, then later tonight. */
export default function SoonPage() {
  return (
    <Shell tab="soon">
      <SoonBoard data={toListData(loadAll())} areas={areas} />
    </Shell>
  );
}
