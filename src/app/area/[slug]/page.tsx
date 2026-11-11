import type { Metadata } from "next";
import { FilmList } from "@/components/FilmList";
import { Page } from "@/components/Page";
import { ShowingsBoard } from "@/components/ShowingsBoard";
import { areaBySlug, areas, loadArea } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => areas.map((area) => ({ slug: area.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Starting soon in ${areaBySlug((await params).slug).name} · Sinima` };
}

/** "Starting soon near you" for one area (D-18, UI brief §4.1 and §4.5). */
export default async function AreaPage({ params }: Props) {
  const area = areaBySlug((await params).slug);
  const data = toListData(loadArea(area.slug));
  // Only start times: enough to say how many showings start soon next door (D-22).
  const neighbours = area.neighbours.map((slug) => ({
    slug,
    name: areaBySlug(slug).name,
    starts: loadArea(slug).showings.map((showing) => showing.startsAt),
  }));
  return (
    <Page area={area.slug}>
      <h1 className="mx-4 mt-2 mb-4 text-page font-semibold tracking-[-0.01em]">Starting soon in {area.name}</h1>
      <ShowingsBoard data={data} place={area.name} neighbours={neighbours} />
      <FilmList data={data} />
    </Page>
  );
}
