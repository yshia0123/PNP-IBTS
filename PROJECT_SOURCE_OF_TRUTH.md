# PROJECT_SOURCE_OF_TRUTH.md

## PNP Integrated Benefits Tracking System (IBTS) — Frontend Prototype

> **Document type:** Single Source of Truth (SSOT) for developers and Kiro agent workflows.
> **Scope:** Frontend prototype only. No production backend, no monetization, no business modeling.

---

## 1. System Overview & Scope

### 1.1 System Purpose
IBTS is a centralized web portal for tracking officer benefits, claims, and personnel records across an organization. It gives managers and administrators a single view of an officer's service history, active benefits, pending claims, and dependent-related actions, replacing scattered spreadsheets and manual lookups.

### 1.2 Core Target Users & Roles
| Role | Primary Needs |
|---|---|
| **Admin** | Full system access, user management, audit oversight |
| **HR Manager** | Personnel records, benefits approval, reporting |
| **Officer/Personnel** | View own profile, benefits status, submit claims |
| **Retiree** | View pension/retirement benefits, insurance status |
| **Dependent** | Limited view — verification requests, insurance beneficiary status |

### 1.3 Prototype Goals
- Fully interactive frontend with realistic UI states (loading, empty, error, success)
- Rich visual components: charts, data tables, status badges, alert feeds
- Mock API layer that behaves like a real backend (latency, pagination, filtering, validation errors)
- Local, resettable data — no external dependencies required to run the demo

### 1.4 Explicit Non-Goals
- No production authentication/authorization (mock role-switcher instead)
- No real backend infrastructure, cloud services, or CI/CD pipelines
- No monetization, billing, or business-model logic
- No real personnel/PNP data — all seed data is fictional

---

## 2. UI/UX Architecture & Layout Breakdown

### 2.1 Reference Interface Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Search | Notifications | Role Switcher | Avatar│
├───────────┬─────────────────────────────────────────────────┤
│           │ PROFILE HERO                                      │
│           │ (Name, Rank, Photo, Service Years, Div/Unit)      │
│ SIDEBAR   ├─────────────────────────────────────────────────┤
│ - Dashboard │ PERFORMANCE & BENEFITS PORTFOLIO                │
│ - Personnel │ (Profile summary, Service Years chart,          │
│ - Claims    │  Promotion History timeline)                    │
│ - Retirees  ├─────────────────────────────────────────────────┤
│ - Financial │ BENEFITS SUMMARY (3-card grid)                  │
│ - Audit Log │ Active Benefits | Retirement Track | Insurance  │
│ - Settings  ├─────────────────────────────────────────────────┤
│           │ ACTION REQUIRED FEED                              │
│           │ (Alerts, Urgent Dependent Verification requests)  │
├───────────┴─────────────────────────────────────────────────┤
│ SYSTEM STATUS BAR: Health indicator | Last Data Sync time     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Hierarchy Tree

```
App
└─ RootLayout (Shell)
   ├─ Header (SmartContainer)
   │  ├─ SearchBar
   │  ├─ NotificationBell (badge + dropdown)
   │  ├─ RoleSwitcher (dev/demo tool)
   │  └─ UserMenu
   ├─ Sidebar (SmartContainer)
   │  ├─ NavItem[] (collapsible on mobile)
   │  └─ SidebarFooter (system version)
   ├─ PageContent (route-driven)
   │  ├─ DashboardPage (SmartContainer)
   │  │  ├─ ProfileHeroCard
   │  │  ├─ PerformanceBenefitsPortfolio
   │  │  │  ├─ ServiceYearsChart (Recharts)
   │  │  │  └─ PromotionHistoryTimeline
   │  │  ├─ BenefitsSummaryGrid
   │  │  │  ├─ BenefitCard (Active Benefits)
   │  │  │  ├─ BenefitCard (Retirement Track)
   │  │  │  └─ BenefitCard (Insurance & Death Benefits)
   │  │  └─ ActionRequiredFeed
   │  │     └─ AlertItem[] (AlertBadge + action buttons)
   │  ├─ PersonnelPage
   │  │  └─ PersonnelDataTable (sortable, filterable, paginated)
   │  ├─ ClaimsPage
   │  │  ├─ ClaimsDataTable
   │  │  └─ ClaimWorkflowModal (multi-step form)
   │  ├─ RetireesPage
   │  │  └─ RetireeSearch + RetireeDataTable
   │  ├─ FinancialReportsPage
   │  │  └─ ReportChart[] + ExportButton (mock)
   │  ├─ AuditLogsPage
   │  │  └─ AuditLogTable (read-only, timestamped)
   │  └─ SettingsPage
   │     └─ SettingsForm (profile, preferences, theme)
   └─ StatusBar (SmartContainer)
      ├─ SystemHealthIndicator
      └─ LastSyncTimestamp
```

**Presentational (dumb) components** — reused across pages: `Card`, `Badge`, `DataTable`, `Modal`, `Skeleton`, `EmptyState`, `ErrorBoundary`, `Toast`.

### 2.3 UI/UX Design System

**Color Palette**
| Token | Hex | Usage |
|---|---|---|
| `--navy-900` | `#0B1D3A` | Sidebar/header background (dark mode base) |
| `--navy-700` | `#132C5C` | Card headers, active nav item |
| `--blue-500` | `#2563EB` | Primary actions, links |
| `--success-500` | `#16A34A` | Approved/active status |
| `--warning-500` | `#D97706` | Pending/attention status |
| `--danger-500` | `#DC2626` | Urgent alerts, rejected status |
| `--neutral-50..900` | grayscale ramp | Backgrounds, text, borders |

- **Typography:** Inter or IBM Plex Sans. Scale: `text-xs` (12px) to `text-3xl` (30px), 1.5 line-height for body.
- **Dark/Light mode:** CSS variables via `data-theme` attribute; default to light, offer toggle in Settings.
- **Accessibility (WCAG 2.1 AA):** minimum 4.5:1 contrast, visible focus rings, `aria-label` on icon-only buttons, keyboard-navigable tables and modals, semantic landmarks (`<nav>`, `<main>`, `<aside>`).

### 2.4 Role-Based View Matrix
| View | Admin | HR Manager | Officer | Retiree | Dependent |
|---|---|---|---|---|---|
| Dashboard | Full | Full | Own data only | Retirement-focused | Verification-focused |
| Personnel Records | Full CRUD | Full CRUD | Read own | — | — |
| Claims Management | Full | Approve/Reject | Submit/View own | Submit/View own | — |
| Retirees | Full | Full | — | Own profile | — |
| Financial Reports | Full | Read | — | — | — |
| Audit Logs | Full | Read | — | — | — |
| Settings | System-wide | Personal | Personal | Personal | Personal |

---

## 3. Tech Stack & Kiro-Driven Frontend Architecture

### 3.1 Recommended Stack
- **Framework:** Next.js 14+ (App Router) — file-based routing suits Kiro's spec-driven scaffolding well. React + Vite is an acceptable lighter alternative.
- **Styling:** Tailwind CSS
- **Components:** Shadcn UI (built on Radix Primitives) for accessible, unstyled-by-default components
- **Icons:** Lucide React
- **Charts:** Recharts
- **Client state:** Zustand (UI/local state) + TanStack Query (server-state simulation, caching, mock fetch lifecycle)
- **Forms:** React Hook Form + Zod validation

### 3.2 Kiro Execution Strategy
- Write one **Kiro spec per feature module** (e.g., `dashboard.spec`, `claims-workflow.spec`) rather than one giant spec — keeps agent context focused and diffs reviewable.
- Use Kiro **hooks** for repetitive scaffolding (new page + route + nav entry) so structure stays consistent across modules.
- Break each phase (Section 5) into **step-by-step prompts**: one prompt per component, not per page, so Kiro output stays reviewable.
- After each generated feature, run an explicit **lint + type-check + smoke-test iteration** before moving to the next prompt — treat this as a hard gate, not optional cleanup.
- Keep a `KIRO_LOG.md` alongside this file noting which prompts produced which files, so regenerations don't clobber manual edits.

### 3.3 Mock Data Strategy
- Local JSON fixtures in `/mock-data/*.json`, one file per entity (`users.json`, `personnel.json`, etc.)
- **MSW (Mock Service Worker)** intercepts `fetch`/`axios` calls at the network layer so components use real request/response code paths, not hardcoded props.
- TanStack Query wraps all mock calls, giving realistic loading/error/stale states for free.
- Simulate latency (300–800ms) and occasional error responses (5% rate) in MSW handlers to force the UI to handle real-world conditions.

### 3.4 Initialized Database Strategy
- **ORM:** Prisma with SQLite (`file:./dev.db`) — zero external services, single command setup.
- Schema mirrors the mock JSON shapes so switching from MSW to real Prisma queries later is a drop-in swap.
- `prisma/seed.ts` populates the SQLite file from the same JSON fixtures used by MSW, keeping one source of truth for sample data.
- This DB layer is **optional for the prototype** — the frontend should run entirely on MSW/JSON without it; the DB exists so the project can graduate to a real API later without a data-model rewrite.

---

## 4. Initialized Database Schema & Mock Data Models

### 4.1 Core TypeScript Interfaces

```typescript
type Role = "admin" | "hr_manager" | "officer" | "retiree" | "dependent";
type BenefitStatus = "active" | "pending" | "suspended" | "expired";
type ClaimStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";

interface User {
  id: string;
  name: string;
  role: Role;
  rank?: string;        // e.g. "PCOL"
  division?: string;    // e.g. "Benefits Admin Div, DPRM"
  avatarUrl?: string;
  email: string;
}

interface Personnel {
  id: string;
  userId: string;
  fullName: string;
  rank: string;
  serviceYears: number;
  joinDate: string;      // ISO date
  promotionHistory: PromotionRecord[];
  status: "active" | "retired" | "separated";
}

interface PromotionRecord {
  id: string;
  fromRank: string;
  toRank: string;
  date: string;
}

interface Benefit {
  id: string;
  personnelId: string;
  type: "active_benefit" | "retirement" | "insurance";
  label: string;
  status: BenefitStatus;
  amount?: number;
  effectiveDate: string;
  expiryDate?: string;
}

interface Claim {
  id: string;
  personnelId: string;
  benefitId: string;
  status: ClaimStatus;
  submittedDate: string;
  reviewedBy?: string;
  notes?: string;
}

interface Dependent {
  id: string;
  personnelId: string;
  fullName: string;
  relationship: "spouse" | "child" | "parent" | "other";
  verificationStatus: "verified" | "pending" | "unverified";
  requestedDate?: string;
}

interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
}

interface Notification {
  id: string;
  userId: string;
  type: "alert" | "info" | "action_required";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
```

### 4.2 Seed Data Blueprint (excerpt)

```json
{
  "users": [
    {
      "id": "u-001",
      "name": "Alex V. Cruz",
      "role": "hr_manager",
      "rank": "PCOL",
      "division": "Benefits Admin Div, DPRM",
      "email": "a.cruz@ibts.local"
    }
  ],
  "personnel": [
    {
      "id": "p-001",
      "userId": "u-001",
      "fullName": "Alex V. Cruz",
      "rank": "PCOL",
      "serviceYears": 21,
      "joinDate": "2004-06-01",
      "status": "active",
      "promotionHistory": [
        { "id": "pr-1", "fromRank": "PLT", "toRank": "PCPT", "date": "2010-03-15" },
        { "id": "pr-2", "fromRank": "PCPT", "toRank": "PMAJ", "date": "2015-08-01" },
        { "id": "pr-3", "fromRank": "PMAJ", "toRank": "PCOL", "date": "2021-01-10" }
      ]
    }
  ],
  "dependents": [
    {
      "id": "d-001",
      "personnelId": "p-001",
      "fullName": "Maria Cruz",
      "relationship": "spouse",
      "verificationStatus": "pending",
      "requestedDate": "2026-09-01"
    }
  ],
  "notifications": [
    {
      "id": "n-001",
      "userId": "u-001",
      "type": "action_required",
      "title": "Dependent Verification Needed",
      "message": "Verification pending for Maria Cruz (Spouse).",
      "read": false,
      "createdAt": "2026-09-05T09:00:00Z"
    }
  ]
}
```

---

## 5. Step-by-Step Prototype Implementation Roadmap (Kiro Workflow)

### Phase 1 — Environment & Kiro Setup
1. Scaffold Next.js (App Router) + TypeScript project.
2. Install and configure Tailwind CSS, Shadcn UI CLI, Lucide, Recharts, Zustand, TanStack Query.
3. Build the Shell Layout: Header, Sidebar (with collapse state in Zustand), StatusBar.
4. Set up MSW with an empty handler file and confirm interception works end-to-end.

### Phase 2 — Core Dashboard Implementation
5. Build `ProfileHeroCard` bound to mock `Personnel` data.
6. Build `PerformanceBenefitsPortfolio` (ServiceYearsChart + PromotionHistoryTimeline).
7. Build `BenefitsSummaryGrid` with three `BenefitCard` variants (color-coded by status).
8. Build `ActionRequiredFeed` reading from `Notification` mock data, with dismiss/mark-read actions.

### Phase 3 — Module Views Setup
9. Build reusable `DataTable` (sort, filter, paginate) and apply it to Personnel, Claims, Retirees.
10. Build `ClaimWorkflowModal` as a multi-step form (submit → review → decision).
11. Build `RetireeSearch` with debounced filtering over the retiree dataset.

### Phase 4 — Interactive State Management
12. Wire all forms through React Hook Form + Zod, with mock submit handlers (MSW POST endpoints).
13. Implement optimistic UI updates via TanStack Query mutations (e.g., claim status change).
14. Implement global search and role-switching (Zustand store), gating visible nav/routes by role.

### Phase 5 — Prototype Polishing
15. Add `Skeleton` loading states to every data-fetching component.
16. Add `EmptyState` components for zero-result tables/feeds.
17. Wrap route segments in `ErrorBoundary` with a friendly fallback UI.
18. Final pass: keyboard navigation audit, responsive breakpoint check (mobile sidebar collapse), and a local demo script (`README-DEMO.md`) for walking through the prototype.

---

## 6. First-Job Developer Blueprint & Frontend Checklist

### 6.1 UI/UX Edge Cases Often Missed
- **Text truncation:** long names/labels need `truncate` + `title` attribute (tooltip) rather than silent overflow.
- **Table pagination:** always handle the last-partial-page case and a "0 results" state, not just the happy path.
- **Responsive sidebar:** collapse to icon-only or off-canvas below `md` breakpoint; ensure toggle is keyboard-accessible.
- **Loading states:** every async component needs a skeleton — never a blank flash or layout shift when data arrives.
- **Keyboard navigation:** modals must trap focus and close on `Esc`; tables must be navigable with arrow/tab keys.

### 6.2 Coding Standards & Structure
- **Folder structure:** feature-based (`/features/claims/`, `/features/personnel/`) over layer-based — keeps related components, hooks, and mock handlers together and scales better with Kiro's per-feature spec workflow.
- **Component rules:** presentational components take props only, no data fetching; smart containers own data fetching and pass props down.
- **Naming:** `PascalCase` components, `camelCase` hooks (`useClaimsTable`), colocate `*.test.tsx` next to source.
- **Git commits:** Conventional Commits (`feat:`, `fix:`, `chore:`) — one logical change per commit, mirroring one Kiro prompt per commit where practical.
