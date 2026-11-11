import type { Metadata } from "next";
import { FilmList } from "@/components/FilmList";
import { Page } from "@/components/Page";
import { ShowingsBoard } from "@/components/ShowingsBoard";
import { AREA_KEY } from "@/lib/area";
import { areas, loadAll } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";

export const metadata: Metadata = { title: "Starting soon in Lagos · Sinima" };

// A returning visitor goes straight to their area (D-18). The saved area is only on the phone,
// so this runs there, before the page is drawn. An area that no longer exists is ignored.
const toSavedArea = `try{var a=localStorage.getItem(${JSON.stringify(AREA_KEY)});if(${JSON.stringify(areas.map((area) => area.slug))}.indexOf(a)>-1)location.replace("/area/"+a)}catch(e){}`;

/** All of Lagos: the same screen as an area page (UI brief §4.1). */
export default function Home() {
  const file = loadAll();
  const data = toListData(file);
  return (
    <Page area={null}>
      <script dangerouslySetInnerHTML={{ __html: toSavedArea }} />
      <h1 className="mx-4 mt-2 mb-4 text-page font-semibold tracking-[-0.01em]">Starting soon in Lagos</h1>
      <ShowingsBoard data={data} place="Lagos" />
      <FilmList data={data} />
    </Page>
  );
}
