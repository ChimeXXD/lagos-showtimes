import Link from "next/link";
import { AreaPicker } from "@/components/AreaPicker";
import { LogoMark } from "@/components/Logo";
import { areas } from "@/lib/data/load";

/**
 * The frame every page shares: header with the area button, the page, and the footer note.
 * `area` is the area page's slug, null on the all-Lagos page, and left out on any other page.
 */
export function Page({ area, children }: { area?: string | null; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl pb-8">
      <header className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Link href="/" data-testid="wordmark" className="mr-auto flex min-h-11 items-center gap-2 text-[19px] font-semibold">
          <LogoMark className="h-7 w-auto" />
          Sinima
        </Link>
        <AreaPicker areas={areas.map(({ slug, name, cinemas }) => ({ slug, name, cinemas }))} current={area} />
      </header>
      <main>{children}</main>
      <footer className="mx-4 mt-8 text-fresh text-text-muted">
        <p data-testid="footer.note">Times come from each cinema&apos;s own pages. Always book on the cinema&apos;s site.</p>
      </footer>
    </div>
  );
}
