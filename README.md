# Sinima

**What's starting soon near me, and should I stay after the credits?** A fast, light web app with every Lagos cinema's showtimes in one place. Every time says where it came from and how fresh it is.

> Work in progress. A one-week portfolio build by [Chime Ekpendu](https://chimexd.work) with Claude Code. "Sinima" is how "cinema" is said and spelt in Yoruba and Hausa. This README is rewritten on launch day, when the repo goes public.

- **Idea and research:** [`docs/PRD.md`](docs/PRD.md)
- **Plan:** [`docs/PLAN.md`](docs/PLAN.md) · **Decisions:** [`docs/DECISIONS.md`](docs/DECISIONS.md) · **Spec:** [`docs/SPEC.md`](docs/SPEC.md) · **Data format:** [`docs/DATA.md`](docs/DATA.md)

## How the data works

Showtimes come from cinemas' own pages or from listings that gave permission. Each source is listed with its status in [`data/sources.json`](data/sources.json). Nothing is fetched on a schedule until its owner agrees or its terms allow it. Booking always happens on the cinema's own site. No ads, no ticket sales, no commission.

Film data and credits-scene tags come from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.

Want something changed or removed? Open an issue (or use the contact on the About page, once live).

## Run it

Requires Node 22. The app is scaffolded on Day 0.

```bash
npm ci
cp .env.example .env.local   # add a TMDB key for the build
npm run dev
npm test && npm run test:e2e
```

## Licence

MIT. Showtimes belong to the cinemas; film data belongs to TMDB and its contributors.
