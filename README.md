# IBTS — Integrated Benefits Tracking System (Frontend Prototype)

A centralized web portal prototype for tracking officer benefits, claims, and
personnel records. This repository is a **frontend prototype only** — no
production backend, authentication, or business logic.

> **Architecture reference:** All architecture, UI/UX, component hierarchy,
> tech stack, data models, and the implementation roadmap live in
> [`PROJECT_SOURCE_OF_TRUTH.md`](./PROJECT_SOURCE_OF_TRUTH.md). Treat that
> document as the single source of truth.

## Status

**All modules complete.** Shell, dashboard, and every module are built:
Personnel (with add-officer + edit), Claims (request + review workflow),
Financial Reports (charts + CSV export), Compensation (per-person pay editor),
Audit Log, and Settings (profile + change password). Polish (skeletons, empty
states, route error boundaries, demo script) is in place.

The system covers **active personnel only** across three roles — Admin,
HR Manager, and Officer.

Access is behind a **mock login** (not real security — SSOT Section 1.4). The
signed-in role re-scopes data and gates which sidebar modules and actions are
available, per the Role-Based View Matrix (SSOT Section 2.4).

| Role | Demo account | Sees |
|---|---|---|
| Admin | j.reyes@ibts.local / admin123 | All modules, full access (incl. Compensation edit) |
| HR Manager | a.cruz@ibts.local / hr123 | All modules; read-only Financial, Compensation & Audit |
| Officer (PCPT) | s.bautista@ibts.local / officer123 | Dashboard, Personnel (read), Claims (own), Settings |
| Officer (PCOL) | r.lingayo@ibts.local / officer123 | Dashboard, Personnel (read), Claims (own), Settings |
| Officer (PGEN) | m.santos@ibts.local / officer123 | Dashboard, Personnel (read), Claims (own), Settings |
| Officer (PLT) | g.villanueva@ibts.local / officer123 | Dashboard, Personnel (read), Claims (own), Settings |
| Officer (NUP) | e.ramos@ibts.local / officer123 | Dashboard, Personnel (read), Claims (own), Settings |

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

## How the API works

- Server-side API routes under `src/app/api/*` are backed by Supabase (see
  `src/lib/supabase-server.ts`), covering auth, dashboard, personnel, claims,
  financial, compensation, audit, notifications, and search.
- The browser never talks to Supabase directly — all access goes through the
  API routes, which use a server-only service-role client.
- Local JSON fixtures live in [`/mock-data`](./mock-data) and were used to seed
  the Supabase tables; they match the interfaces in `src/lib/types.ts`
  (SSOT Section 4.1).

## Authentication (mock)

The app is gated by a mock login (`/login`). Credentials are validated by the
`/api/session/login` route against the Supabase `users` table; the session
persists to `localStorage`. This is a prototype convenience, **not** a real
security boundary.

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
                           #   auth, dashboard, personnel, claims,
                           #   financial, compensation, settings, search, notifications
  lib/                     # types, utils, permissions, format, stores/,
                           #   supabase-server, db-mappers, api-helpers
PROJECT_SOURCE_OF_TRUTH.md # architecture single source of truth
README-DEMO.md             # end-user tutorial (also exported as PDF)
```

Structure follows the feature-based convention in SSOT Section 6.2.

## Scope

See SSOT Sections 1.3 (goals) and 1.4 (explicit non-goals). No real personnel
data — all seed data is fictional.
