import type { Metadata } from "next";
import Link from "next/link";
import { CinemaBoard } from "@/components/CinemaBoard";
import { Icon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { areaBySlug, areas, loadAll } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => loadAll().cinemas.map((cinema) => ({ id: cinema.id }));

const cinemaById = (id: string) => {
  const cinema = loadAll().cinemas.find((candidate) => candidate.id === id);
  if (!cinema) throw new Error(`No cinema "${id}" in the data`);
  return cinema;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${cinemaById((await params).id).name} · Sinima` };
}

/** One cinema: where it is, then its programme as poster cards. */
export default async function CinemaPage({ params }: Props) {
  const cinema = cinemaById((await params).id);
  const area = areaBySlug(cinema.area);
  return (
    <Shell tab="cinemas">
      <Link className="crumb" href={`/area/${area.slug}`}>
        <Icon name="back" />
        Cinemas near {area.name}
      </Link>
      <div className="hero">
        <div>
          <div className="tags">
            <span className="tag q">{cinema.bookingHost ? "Book online" : "Tickets at the cinema"}</span>
          </div>
          <h1 className="title" data-testid="cinema.title">
            {cinema.name}
          </h1>
          <p className="sub">{cinema.address ?? `${area.name}, Lagos`}</p>
          <div className="actions">
            {cinema.address && (
              <a className="btn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cinema.name}, ${cinema.address}`)}`} target="_blank" rel="noopener">
                <Icon name="map" />
                Open in maps
              </a>
            )}
            {cinema.website && (
              <a className="btn" href={cinema.website} target="_blank" rel="noopener">
                <Icon name="globe" />
                Cinema website
              </a>
            )}
          </div>
        </div>
      </div>
      <CinemaBoard data={toListData(loadAll(), { cinemaId: cinema.id })} areaNames={Object.fromEntries(areas.map((candidate) => [candidate.slug, candidate.name]))} />
    </Shell>
  );
}
