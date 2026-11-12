import type { Metadata } from "next";
import { CinemasBoard } from "@/components/CinemasBoard";
import { Shell } from "@/components/Shell";
import { areaBySlug, areas, loadAll } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => areas.map((area) => ({ slug: area.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Cinemas near ${areaBySlug((await params).slug).name} · Sinima` };
}

/** Home for one area: its cinemas first, then the areas next to it, then the rest of Lagos. */
export default async function AreaPage({ params }: Props) {
  const area = areaBySlug((await params).slug);
  return (
    <Shell tab="cinemas">
      <CinemasBoard data={toListData(loadAll())} areas={areas} area={area.slug} />
    </Shell>
  );
}
