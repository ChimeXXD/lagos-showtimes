// Shapes shared by the data files and the UI. Must match docs/DATA.md and docs/SPEC.md §2.
// Day 1 holds what the wording needs; the rest of schema v1 lands with the validator on Day 2.

export type SourceMethod = "permission-feed" | "public-page" | "api" | "fixture";

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
