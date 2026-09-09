# Mercury

**Live: https://r5sp.github.io/mercury-dashboard/**

A front-end sales performance dashboard. Open it and the state of the business is
on screen: revenue, orders closed, average order value, open pipeline, a revenue
trend you can set to 7, 30 or 90 days, a sortable roster of sales
representatives, and a per-person detail panel that opens without leaving the
page.

No backend, no database, no login. Every figure is derived at runtime from one
committed JSON file of fictional data.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (http://localhost:5173 by default).

```bash
npm run build     # type-check and bundle into dist/
npm run preview   # serve the production bundle
```

Node 18 or newer.

## What is on the page

**Headline figures.** Total revenue, orders closed, average order value and open
pipeline. The first three carry a change against the equally long window
immediately before the one selected, so "last 30 days" is measured against the 30
days before that. Pipeline is a point-in-time number and carries no delta;
its footnote gives the opportunity count and the probability-weighted value.

**Revenue over time.** One measure at a time on a single axis - revenue or order
count - with a crosshair and a tooltip carrying both. The reporting-period control
at the top of the page drives this chart, the headline figures and the roster
together.

**The roster.** One row per representative: region, revenue with its change,
orders with average order value, conversion rate with the won/lost split that
produced it, open pipeline, quota attainment, status, and a revenue sparkline.
Search matches name, region and role. Region and status filter the list. Every
numeric column sorts, ascending or descending. On a phone each row becomes a card
and sorting moves into a select.

**Representative detail.** Selecting a row opens a panel over the dashboard:
quarterly target with attainment and pace, the same period figures for that
person, six months of monthly revenue, every open opportunity with stage and
probability, and that person's recent activity. Escape or the scrim closes it.

**Recent activity.** Deals won and lost, opportunities created and advanced,
meetings logged, and quota milestones, newest first.

## How the numbers work

Nothing is a hard-coded display value. The dataset holds *events* - closed orders,
lost deals, open opportunities, activity - and every figure on screen is computed
from them in `src/lib/metrics.ts`. That is what keeps the dashboard internally
consistent: a rep's status badge, quota bar and revenue column cannot disagree,
because all three come from the same orders.

Two definitions worth stating outright:

- **Conversion rate** is won deals divided by decided deals (won plus lost) in the
  selected window. Open opportunities are not counted against it.
- **Status** is pace against quota, not raw attainment: attainment divided by the
  share of the quarter already elapsed. Ahead is 1.05 or better, at risk is below
  0.90, on track is in between. The tick on each quota bar marks the elapsed
  share, so a fill short of the tick is behind pace.

## The data

`src/data/mercury.json` is generated, not hand-written:

```bash
npm run generate:data
```

`scripts/generate-data.mjs` is seeded, so the output is reproducible. It writes
245 days of deal flow for 10 representatives across 5 regions, with weekday and
month-end shape, a mild upward trend, and per-rep strength and momentum. Quotas
are back-solved from each rep's realized quarter-to-date revenue and a target
pace, which is why the roster shows a believable spread of ahead, on track and at
risk rather than everyone at 400% of a made-up number.

Every name, account and figure is fictional. There are no real customers or
people in this repository.

## Keyboard

The interface is keyboard-first, which is most of what separates a tool from a
page.

| Key | Action |
|---|---|
| `Cmd/Ctrl K` | Command palette: jump to any rep, switch period, toggle theme |
| `/` | Focus the roster search |
| `1` `2` `3` | 7 / 30 / 90 day reporting period |
| `t` | Toggle light and dark |
| `Esc` | Close the palette or the detail panel |

Table rows are focusable and open on Enter.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. The build runs `tsc` first, so a type error fails
the deploy rather than shipping. Vite is configured with a relative `base`, so the
same `dist/` works from a subpath, from a different host, or opened off disk.

## Design notes

The full system is written down in [DESIGN.md](DESIGN.md), including the list of
things it deliberately refuses to do. In short: ink on warm paper, IBM Plex Sans
with IBM Plex Mono for every numeral, one claret accent reserved for identity and
selection, hairline rules instead of shadows, and charts drawn in ink rather than
colour. Status is never carried by colour alone - a dot always sits beside its
written label. Light is the default and dark is separately specified rather than
an inversion of it.

## Layout of the source

```
src/
  data/          the committed dataset, its types, and the typed loader
  lib/           formatting and the metric derivations
  components/    KPI row, revenue chart, roster, detail drawer, activity feed
  App.tsx        state: reporting period, measure, filters, sort, selection
scripts/         the seeded data generator
```

## Stack

React 18, TypeScript in strict mode, Vite, Recharts, and hand-written CSS with
design tokens. No UI framework and no state library - the app has one screen and
its state fits in `useState`.
