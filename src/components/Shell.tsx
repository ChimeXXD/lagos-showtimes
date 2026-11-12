import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Search } from "@/components/Search";
import { Tabs, type TabId } from "@/components/Tabs";
import { areas, loadAll } from "@/lib/data/load";

// Every page builds the same film list for search: read and sort it once per build, not once per page.
let searchFilms: { id: string; title: string }[] | undefined;
const filmsForSearch = () =>
  (searchFilms ??= loadAll().films.map(({ id, title }) => ({ id, title })).sort((a, b) => a.title.localeCompare(b.title)));

/** The frame every page shares: the logo, the three ways in, search, and the footer note. */
export function Shell({ tab, children }: { tab: TabId; children: React.ReactNode }) {
  return (
    <>
      <header className="top">
        <Link href="/" className="logo" data-testid="wordmark">
          <LogoMark />
          Sinima
        </Link>
        <Tabs tab={tab} areas={areas.map((area) => area.slug)} />
        <Search films={filmsForSearch()} />
      </header>
      <main className="wrap">{children}</main>
      <footer className="foot">
        <p data-testid="footer.note">Times come from each cinema&apos;s own pages. Always book on the cinema&apos;s site.</p>
        <p data-testid="footer.logos">
          Cinema logos belong to their owners and only name each cinema. A cinema that wants its logo removed can{" "}
          <a href="https://github.com/ChimeXXD/sinima/issues">ask here</a>; it goes the same day.
        </p>
      </footer>
    </>
  );
}
