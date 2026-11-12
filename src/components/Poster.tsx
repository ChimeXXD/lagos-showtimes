import type { ListFilm } from "@/lib/data/select";

// A film's artwork. TMDB's poster where it has one; otherwise a title poster in the app's own
// colours. A film never shows as an empty box (D-49).

const TMDB_IMAGES = "https://image.tmdb.org/t/p/";
const DOODLES = [
  <><circle cx="58" cy="58" r="34" /><circle cx="58" cy="58" r="16" /><path d="M58 8v12M108 58H96M22 22l9 9" /></>,
  <path key="w" strokeLinejoin="round" d="M6 78l14-18 14 18 14-18 14 18 14-18 14 18M6 50l14-18 14 18 14-18 14 18 14-18 14 18" />,
  <><path d="M60 14l8 26 26 8-26 8-8 26-8-26-26-8 26-8z" /><path d="M22 70l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" /></>,
];
const hash = (text: string) => [...text].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

/** `small` is for the strip on a cinema card and the ticket; the default is a poster card. */
export function Poster({ film, small = false }: { film: ListFilm; small?: boolean }) {
  if (film.poster) {
    const [one, two] = small ? ["w154", "w342"] : ["w342", "w500"];
    return (
      // eslint-disable-next-line @next/next/no-img-element -- a static export has no image optimiser; TMDB serves sized files
      <img className="po" src={`${TMDB_IMAGES}${one}${film.poster}`} srcSet={`${TMDB_IMAGES}${one}${film.poster} 1x, ${TMDB_IMAGES}${two}${film.poster} 2x`} alt="" loading="lazy" decoding="async" width={342} height={513} />
    );
  }
  const seed = hash(film.id);
  return (
    <div className={`tp ${"abcde"[seed % 5]}`}>
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" aria-hidden="true">
        {DOODLES[seed % 3]}
      </svg>
      <b className={film.title.length > 16 ? "long" : undefined} data-testid="poster.title">
        {film.title}
      </b>
      <i aria-hidden="true">Now showing · Lagos</i>
    </div>
  );
}
