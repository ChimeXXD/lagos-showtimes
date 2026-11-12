import type { Metadata } from "next";
import Link from "next/link";
import { FilmBoard } from "@/components/FilmBoard";
import { Icon } from "@/components/Icons";
import { Poster } from "@/components/Poster";
import { Shell } from "@/components/Shell";
import { areas, loadAll } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";
import { filmMeta } from "@/lib/wording/film";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => loadAll().films.map((film) => ({ slug: film.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${loadAll().films.find((film) => film.id === slug)?.title ?? "Film"} · Sinima` };
}

/** One film: its poster and Stay or Go, then every cinema showing it. */
export default async function FilmPage({ params }: Props) {
  const { slug } = await params;
  const data = toListData(loadAll(), { filmId: slug });
  const film = data.films[0];
  if (!film) throw new Error(`No film "${slug}" in the data`);
  return (
    <Shell tab="films">
      <Link className="crumb" href="/films">
        <Icon name="back" />
        Films in Lagos
      </Link>
      <div className="film">
        <div>
          <div className="fposter">
            <div>
              <Poster film={film} />
            </div>
            <div>
              <h1 className="title" style={{ fontSize: 34, marginTop: 16 }} data-testid="film.title">
                {film.title}
              </h1>
              <p className="sub">{filmMeta(film)}</p>
            </div>
          </div>
          <div className="stay">
            <b data-testid="credits.chip">{film.stay.chip}</b>
            <span data-testid="credits.detail">{film.stay.detail}</span>
          </div>
        </div>
        <div>
          <FilmBoard data={data} areas={areas} />
        </div>
      </div>
    </Shell>
  );
}
