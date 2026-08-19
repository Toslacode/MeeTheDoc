# MeeTheDoc

Frontend scaffold for MeeTheDoc. This repository currently contains **structure
and tooling only** — the product itself has not been built yet.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- React 19
- TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) primitives (`components/ui/`)
- ESLint (`eslint-config-next`)
- Vitest + Testing Library + jsdom

## Prerequisites

- Node.js **22+**
- npm **10+** (npm is the package manager for this repo — do not use pnpm, yarn, or bun)

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `npm run dev` | `next dev` | Start the development server. |
| `npm run build` | `next build` | Production build. |
| `npm start` | `next start` | Serve the production build (requires `build` first). |
| `npm run lint` | `eslint` | Lint with the Next.js ESLint config. |
| `npm run typecheck` | `tsc --noEmit` | Type-check the project in strict mode. |
| `npm test` | `vitest run` | Run the test suite once. |
| `npm run test:watch` | `vitest` | Run tests in watch mode. |

## Routes

Placeholder pages only — each renders its own route path as text.

- `/`
- `/doctor`
- `/doctor/calls`
- `/doctor/availability`
- `/family`

## Folder structure

```
app/                              App Router pages, layout, and global styles
components/                       Shared React components
components/ui/                    shadcn/ui primitives (generated; edit deliberately)
components/family/                Components for the family-facing experience
components/doctor/                Components for the doctor-facing experience
lib/                              Framework-agnostic helpers (e.g. `cn`)
types/                            Shared TypeScript types
tests/                            Vitest test suites
public/                           Statically served files
public/assets/                    Production assets, served at /assets/...
public/assets/branding/           Logos, wordmarks, brand marks
public/assets/design-references/  Reference imagery the app actually renders
public/assets/icons/              Standalone icon files
public/assets/mock/               Placeholder media used by the UI
design/                           Design material for humans and agents (never served)
design/references/                Visual design references (screenshots, mockups)
```

## `design/references/` vs `public/assets/`

These two look similar and are **not** interchangeable.

- **`design/references/`** holds *visual guidance* for building the product:
  layout, hierarchy, spacing, typography, component appearance, overall visual
  language. It lives outside `public/`, so it is never bundled or served. Sample
  content inside a reference (names, times, numbers) is illustrative filler —
  **never copy it into the product as data.** See
  [`design/references/README.md`](design/references/README.md).
- **`public/assets/`** holds *real production assets* that the app renders and
  that are publicly reachable at `/assets/...`. See
  [`public/assets/README.md`](public/assets/README.md).

## No backend yet

There is **no backend in this repository**: no database, no ORM, no
authentication, no API routes, no server actions, and no third-party service
integrations (Supabase, Google APIs, email providers, etc.). Nothing reads or
writes data. Every page is a static placeholder. Backend work is a separate,
later decision.
