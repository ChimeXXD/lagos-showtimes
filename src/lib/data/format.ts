// The format of a showing as the app says it (D-50): IMAX, 4D or 3D. Standard 2D, and a format
// we do not know, give no tag. A format is never guessed.

export type FormatTag = "IMAX" | "4D" | "3D";
export const FORMAT_TAGS: FormatTag[] = ["IMAX", "4D", "3D"];

/** "IMAX 2D" is IMAX; "MX4D" and "4DX" are 4D (moving seats); "3D" is 3D. */
export function formatTag(format: string | null | undefined): FormatTag | null {
  const text = (format ?? "").trim().toUpperCase();
  if (text.startsWith("IMAX")) return "IMAX";
  if (text === "MX4D" || text === "4DX" || text === "4D") return "4D";
  if (text === "3D") return "3D";
  return null;
}
