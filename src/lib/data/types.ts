// Schema v1: the shapes shared by the data files and the UI. Must match docs/DATA.md and
// docs/SPEC.md §2. Unknown values are null, never guessed.

export type SourceMethod = "permission-feed" | "public-page" | "api" | "fixture";
export type SourceStatus = "cleared" | "pending" | "refused" | "do-not-use";
export type SourceHealth = "ok" | "suspect" | "failing";

export type CreditsAnswer = "yes" | "no" | "unknown";
export type CreditsConfidence = "confirmed" | "likely" | "unknown";
export type CreditsSource = { name: string; url: string; checkedAt: string };

export type CreditsInfo = {
  during: CreditsAnswer;
  after: CreditsAnswer;
  confidence: CreditsConfidence;
  sources: CreditsSource[];
  count?: number | null;
};

/** When a showing reached us through another listing: the original site and when it was read. */
export type Via = { name: string; url?: string; fetchedAt: string };

export type Source = {
  id: string;
  /** As it reads in a sentence: "Filmhouse's site". */
  name: string;
  url: string;
  method: SourceMethod;
  status: SourceStatus;
  /** Null until the source has been read once. */
  fetchedAt: string | null;
  lastOkAt: string | null;
  health: SourceHealth;
};

export type Cinema = {
  id: string;
  name: string;
  chain: string;
  /** An area slug from data/cinemas.json. */
  area: string;
  address: string | null;
  geo: { lat: number; lng: number } | null;
  website: string | null;
  /** The host its booking links live on, when that is not the website's. */
  bookingHost?: string | null;
  sourceIds: string[];
};

export type FilmOrigin = "nollywood" | "hollywood" | "other";

export type Film = {
  /** A slug made from the title. */
  id: string;
  title: string;
  runtimeMin: number | null;
  /** The rating text the source gives ("18", "PG"). */
  rating: string | null;
  origin: FilmOrigin | null;
  tmdbId: number | null;
  /** TMDB's image path ("/abc.jpg") for the poster; left out or null when there is none. */
  posterPath?: string | null;
  credits?: CreditsInfo | null;
};

export type Price = { amountNgn: number; label: string | null };

export type Showing = {
  /** `<cinemaId>_<filmId>_<startsAt>` */
  id: string;
  filmId: string;
  cinemaId: string;
  screenId: string | null;
  /** UTC, ending in Z. */
  startsAt: string;
  format: string | null;
  language: string | null;
  price: Price | null;
  /** Null when the cinema has no booking page: "Tickets at the cinema". */
  bookingUrl: string | null;
  sourceId: string;
  via?: Via | null;
  fetchedAt: string;
};

export type ShowtimesFile = {
  schemaVersion: 1;
  generatedAt: string;
  timeZone: "Africa/Lagos";
  /** True when any showing comes from a fixture; every page then says "Sample data". */
  sample: boolean;
  sources: Source[];
  cinemas: Cinema[];
  films: Film[];
  showings: Showing[];
};
