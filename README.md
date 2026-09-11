# IBTS — Integrated Benefits Tracking System (Frontend Prototype)

A centralized web portal prototype for tracking officer benefits, claims, and
personnel records. This repository is a **frontend prototype only** — no
production backend, authentication, or business logic.

> **Architecture reference:** All architecture, UI/UX, component hierarchy,
> tech stack, data models, and the implementation roadmap live in
> [`PROJECT_SOURCE_OF_TRUTH.md`](./PROJECT_SOURCE_OF_TRUTH.md). Treat that
> document as the single source of truth.

## Status

**All five phases complete.** Shell, dashboard, and every module are built:
Personnel (with add-account + edit), Claims (request + review workflow),
Retirees, Financial Reports (charts + CSV export), Audit Log, and Settings
(profile + change password). Phase 5 polish (skeletons, empty states, route
error boundaries, demo script) is in place.

Access is behind a **mock login** (not real security — SSOT Section 1.4). The
prototype ships **one representative account per role**; the signed-in role
re-scopes data and gates which sidebar modules and actions are available, per
the Role-Based View Matrix (SSOT Section 2.4).

| Role | Demo account | Sees |
|---|---|---|
| Admin | j.reyes@ibts.local / admin123 | All modules, full access |
| HR Manager | a.cruz@ibts.local / hr123 | All modules; read-only Financial & Audit |
| Officer | s.bautista@ibts.local / officer123 | Dashboard, Personnel (read), Claims (own), Settings |
| Retiree | r.domingo@ibts.local / retiree123 | Dashboard, Claims (own), Retirees, Settings |
| Dependent | m.cruz@ibts.local / dependent123 | Dashboard (verification focus), Settings |

Live demo: **https://pnp-ibts.vercel.app** · See
[`README-DEMO.md`](./README-DEMO.md) for the end-user tutorial.

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
- Feature handlers are registered in `src/mocks/handlers.ts` (auth, dashboard,
  personnel, claims, retirees, financial, audit, notifications, search).
- The mock "database" (`src/mocks/db.ts`) is seeded from the JSON fixtures and
  **persisted to `localStorage`**, so changes (new claims, decisions, created
  accounts, notifications) survive reloads and logout/login. To reset, clear
  the `ibts-mock-db:1` key in localStorage.

Local JSON fixtures live in [`/mock-data`](./mock-data), one file per entity,
matching the interfaces in `src/lib/types.ts` (SSOT Section 4.1).

## Authentication (mock)

The app is gated by a mock login (`/login`). Credentials are validated against
`mock-data/credentials.json` via MSW; the session persists to `localStorage`.
This is a prototype convenience, **not** a real security boundary.

## Project Structure

```
mock-data/                 # JSON fixtures used to seed the Supabase database
public/                    # static assets + pnp-logo.png
src/
  app/                     # App Router: layout, login, module routes, error/loading
    api/                   # Server-side API routes (Supabase-backed)
  components/
    layout/                # Shell: header, sidebar, status-bar, app-shell, auth-gate
    ui/                    # Reusable primitives: card, badge, data-table, modal, toaster, ...
  features/                # Feature-based modules:
                           #   auth, dashboard, personnel, claims, retirees,
                           #   financial, settings, search, notifications
  lib/                     # types, utils, permissions, format, stores/,
                           #   supabase-server, db-mappers, api-helpers
PROJECT_SOURCE_OF_TRUTH.md # architecture single source of truth
README-DEMO.md             # end-user tutorial (also exported as PDF)
```

Structure follows the feature-based convention in SSOT Section 6.2.

## Scope

See SSOT Sections 1.3 (goals) and 1.4 (explicit non-goals). No real personnel
data — all seed data is fictional.
