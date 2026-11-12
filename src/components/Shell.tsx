import Link from "next/link";
import { Icon } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";

const TABS = [
  ["cinemas", "Cinemas", "/"],
  ["films", "Films", "/films"],
  ["soon", "Starting soon", "/soon"],
] as const;

/** The frame every page shares: the logo, the three ways in, search, and the footer note. */
export function Shell({ tab, children }: { tab: (typeof TABS)[number][0]; children: React.ReactNode }) {
  return (
    <>
      <header className="top">
        <Link href="/" className="logo" data-testid="wordmark">
          <LogoMark />
          Sinima
        </Link>
        <nav className="tabs" aria-label="Sections">
          {TABS.map(([id, label, href]) => (
            <Link key={id} href={href} className={id === tab ? "tab on" : "tab"} aria-current={id === tab ? "page" : undefined} data-testid={`tab.${id}`}>
              {label}
            </Link>
          ))}
        </nav>
        <form className="search" action="/films" role="search">
          <Icon name="search" />
          <input type="search" name="q" placeholder="Search a film" aria-label="Search a film" autoComplete="off" />
        </form>
        <Link href="/films" className="round" aria-label="Search a film">
          <Icon name="search" />
        </Link>
      </header>
      <main className="wrap">{children}</main>
      <footer className="foot">
        <p data-testid="footer.note">Times come from each cinema&apos;s own pages. Always book on the cinema&apos;s site.</p>
      </footer>
    </>
  );
}
