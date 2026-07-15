# Autonomic Compass

https://compass-31.com — clinical tools for autonomic and post-concussion
evaluation: COMPASS-31 scoring, NASA Lean Test, Active Stand Test, and a
Patient Evaluation Report generator (initial + re-evaluation) with polished
PDF output.

Everything runs client-side; no patient data leaves the browser. Tool and
report entries persist to `localStorage` on the device as crash-safety
autosave (not a patient database).

## Stack

- Vite + React 19 + TypeScript
- shadcn/ui on **Base UI** (`"style": "base-nova"` in `components.json`) + Tailwind CSS 4
- Zustand stores with `persist` (one per tool + one for the report document)
- `@react-pdf/renderer` for selectable-text PDFs (loaded on demand)
- Vitest for the clinical rules and PDF smoke tests

## Layout

```
src/
  lib/clinical/     pure scoring/flag rules + tests (the source of truth)
  features/
    compass31/      questionnaire data + answers store
    nasa-lean/      test flow components, chart, own PDF export
    active-stand/   entry table with automatic change-from-baseline flags
    report/         document model, form sections, preview, PDF template
  pages/            route-level components
  components/ui/    shadcn (Base UI) primitives
```

The report is a single data structure (`features/report/types.ts`); the form,
the on-screen preview, and the PDF are three renderers of it. Shared
presence/formatting logic lives in `features/report/reportContent.ts`, which
is what guarantees the preview matches the PDF and blank content is omitted.

## Commands

```
npm run dev      # dev server
npm test         # vitest (watch)
npx vitest run   # tests once
npm run build    # production build to dist/
```

## Deployment

AWS Amplify Hosting (app `d33cfe855giuo7`, us-east-1) builds and deploys
automatically on every push to `master`. `compass-31.com` DNS is on Route 53.

Client-side routes (`/compass-31`, `/nasa-lean`, `/active-stand`, `/report`)
need an SPA rewrite in the Amplify console (rewrite `</^[^.]+$/>` → `/index.html`,
type 200) so deep links don't 404.

## Open clinical questions (best-guess defaults in code)

- **CV-01** COMPASS-31 scale: raw /75 (paper workflow) shown as primary with
  the validated weighted /100 alongside. See `lib/clinical/compass31.ts`.
- **CV-02** mBESS direction: implemented as points earned (higher is better),
  red below 20. See `lib/clinical/balance.ts`.
- **CV-03** COMPASS-31 totals above 45 are intentionally unlabeled.
- Site name: "Autonomic Compass" is the working name (preferred option from
  the requirements packet); swap in `Navbar.tsx`, `Home.tsx`, `index.html`,
  `manifest.json`, and `report/pdf/ReportPDF.tsx` once final.
