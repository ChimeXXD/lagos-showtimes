import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { ShowingsBoard } from "@/components/ShowingsBoard";
import { loadAll } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";
import type { ShowtimesFile } from "@/lib/data/types";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => loadAll().films.map((film) => ({ slug: film.id }));

const filmBySlug = (file: ShowtimesFile, slug: string) => {
  const film = file.films.find((candidate) => candidate.id === slug);
  if (!film) throw new Error(`No film "${slug}" in the data`);
  return film;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${filmBySlug(loadAll(), (await params).slug).title} · Sinima` };
}

/** Every showing of one film in Lagos, by start time. Grouping by area and Stay or Go come on Day 4. */
export default async function FilmPage({ params }: Props) {
  const file = loadAll();
  const film = filmBySlug(file, (await params).slug);
  return (
    <Page>
      <h1 data-testid="film.title" className="mx-4 mt-2 mb-4 text-page font-semibold tracking-[-0.01em]">
        {film.title}
      </h1>
      <ShowingsBoard data={toListData(file, { filmId: film.id })} place="Lagos" />
    </Page>
  );
}
