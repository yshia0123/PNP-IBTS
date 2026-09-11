# IBTS — Integrated Benefits Tracking System (Frontend Prototype)

A centralized web portal prototype for tracking officer benefits, claims, and
personnel records. This repository is a **frontend prototype only** — no
production backend, authentication, or business logic.

> **Architecture reference:** All architecture, UI/UX, component hierarchy,
> tech stack, data models, and the implementation roadmap live in
> [`PROJECT_SOURCE_OF_TRUTH.md`](./PROJECT_SOURCE_OF_TRUTH.md). Treat that
> document as the single source of truth.

## Status

**Phase 1 — Environment & Shell** (complete). The app shell (Header, collapsible
Sidebar, Status Bar) and tooling (Tailwind, TanStack Query, Zustand, MSW) are in
place. Dashboard content and feature modules are built in later phases per the
roadmap in Section 5 of the SSOT.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 (design tokens in `src/app/globals.css`) |
| UI primitives | shadcn UI conventions / Radix (added per-component) |
| Icons | Lucide React |
| Charts | Recharts |
| Client state | Zustand |
| Server-state simulation | TanStack Query |
| Forms & validation | React Hook Form + Zod |
| Mock API | Mock Service Worker (MSW) |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server (MSW starts automatically in development)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build       # production build
npm run start       # serve the production build
npm run lint        # ESLint
npm run type-check  # tsc --noEmit
```

## How the mock API works

- MSW intercepts `fetch` calls at the network layer (see `src/mocks/`).
- The service worker script lives at `public/mockServiceWorker.js`.
- In development, the worker is started before the app renders (deferred
  mounting) via `src/mocks/msw-init.tsx`, loaded client-side only.
- A health endpoint (`GET /api/health`) proves interception works — the Status
  Bar calls it on load and shows the result.
- Feature handlers are registered in `src/mocks/handlers.ts` as modules are
  built.

Local JSON fixtures live in [`/mock-data`](./mock-data), one file per entity,
matching the interfaces in `src/lib/types.ts` (SSOT Section 4.1).

## Project Structure

```
mock-data/                 # JSON fixtures (users, personnel, benefits, ...)
public/                    # static assets + mockServiceWorker.js
src/
  app/                     # App Router: layout, page, providers, globals.css
  components/layout/        # Shell: header, sidebar, status-bar, app-shell
  features/                # Feature-based modules (dashboard, claims, ...)
  lib/                     # types, utils, navigation, stores/
  mocks/                   # MSW browser worker, handlers, init
PROJECT_SOURCE_OF_TRUTH.md # architecture single source of truth
```

Structure follows the feature-based convention in SSOT Section 6.2.

## Scope

See SSOT Sections 1.3 (goals) and 1.4 (explicit non-goals). No real personnel
data — all seed data is fictional.
