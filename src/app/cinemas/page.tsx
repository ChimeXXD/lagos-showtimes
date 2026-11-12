import type { Metadata } from "next";
import { CinemasBoard } from "@/components/CinemasBoard";
import { Shell } from "@/components/Shell";
import { AREA_KEY } from "@/lib/area";
import { areas, loadAll } from "@/lib/data/load";
import { toListData } from "@/lib/data/select";

export const metadata: Metadata = { title: "Cinemas in Lagos · Sinima" };

// A returning visitor goes straight to their area's cinemas (D-18, D-55). The saved area is only on
// the phone, so this runs there, before the page is drawn. An area that no longer exists is ignored.
const toSavedArea = `try{var a=localStorage.getItem(${JSON.stringify(AREA_KEY)});if(${JSON.stringify(areas.map((area) => area.slug))}.indexOf(a)>-1)location.replace("/area/"+a)}catch(e){}`;

/** The Cinemas tab: every cinema in Lagos, soonest first (D-49). */
export default function CinemasPage() {
  return (
    <Shell tab="cinemas">
      <script dangerouslySetInnerHTML={{ __html: toSavedArea }} />
      <CinemasBoard data={toListData(loadAll())} areas={areas} area={null} />
    </Shell>
  );
}
