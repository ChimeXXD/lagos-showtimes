// Line icons, drawn on a 24 px grid. Decorative: the control beside each one carries the label.
const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.500-3.500" /></>,
  pin: <><path d="M12 21s7-6.200 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21z" /><circle cx="12" cy="9.500" r="2.500" /></>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  out: <path d="M8 16L17 7M9 7h8v8" />,
  bell: <path d="M6 16V11a6 6 0 0 1 12 0v5l1.500 2h-15zM10 20h4" />,
  share: <path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />,
  link: <path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" />,
  chat: <path d="M4 12a8 8 0 1 1 3.500 6.600L4 20l1.200-3.800A8 8 0 0 1 4 12z" />,
  dots: <><circle cx="6" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></>,
  back: <path d="M15 5l-7 7 7 7" />,
  caret: <path d="M7 10l5 5 5-5" />,
  map: <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18" /></>,
  // A ring with eight short rays set well out from it (after Rune Icons, D-60).
  sun: <><circle cx="12" cy="12" r="3" /><path d="M12 3.500V5M12 19v1.500M3.500 12H5M19 12h1.500M5.990 5.990l1.060 1.060M16.950 16.950l1.060 1.060M5.990 18.010l1.060-1.060M16.950 7.050l1.060-1.060" /></>,
  // A full crescent: a circle (r 8, centred on 12 12 like the sun) with a smaller bite taken from its upper right.
  moon: <path d="M12.385 4.009A8 8 0 1 0 19.991 11.615A5.500 5.500 0 0 1 12.385 4.009z" />,
} as const;

export function Icon({ name }: { name: keyof typeof PATHS }) {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export function Heart({ on }: { on: boolean }) {
  return (
    <svg className={on ? "heart on" : "heart"} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0 1 12 7.300 4.300 4.300 0 0 1 19.500 10c0 5.400-7.500 10-7.500 10z" />
    </svg>
  );
}
