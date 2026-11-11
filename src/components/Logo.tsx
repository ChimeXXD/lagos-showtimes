// The Ticket S mark (D-42): a cinema ticket whose two notches make an S. One cut shape; the
// notches and the three tear-line dots are holes. Source: docs/design/logo/sinima-mark.svg.
const TICKET =
  "M34 8H66A15 15 0 0 1 81 23A3.5 3.5 0 0 1 78.29,26.41A12 12 0 0 0 78.29,49.79A3.5 3.5 0 0 1 81 53.2V77A15 15 0 0 1 66 92H34A15 15 0 0 1 19 77A3.5 3.5 0 0 1 21.71,73.59A12 12 0 0 0 21.71,50.21A3.5 3.5 0 0 1 19 46.8V23A15 15 0 0 1 34 8ZM36.1 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0ZM46.6 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0ZM57.1 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z";

/** Decorative: always sits beside the name, which is the label. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="19 8 62 84" aria-hidden="true" className={className}>
      <path fill="currentColor" fillRule="evenodd" d={TICKET} />
      <g fill="var(--color-logo-dot)">
        <circle cx="39.5" cy="50" r="3.4" />
        <circle cx="50" cy="50" r="3.4" />
        <circle cx="60.5" cy="50" r="3.4" />
      </g>
    </svg>
  );
}
