# PNP IBTS — Demo Walkthrough

A step-by-step script for demonstrating the Integrated Benefits Tracking System
prototype. Everything runs locally on a mock API (MSW) — no backend required.

> Reminder: this is a **prototype**. Authentication and role gating are mock
> conveniences, not real security (see `PROJECT_SOURCE_OF_TRUTH.md` §1.4).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on the **login** page.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | j.reyes@ibts.local | admin123 |
| HR Manager | a.cruz@ibts.local | hr123 |
| Officer | s.bautista@ibts.local | officer123 |
| Retiree | r.domingo@ibts.local | retiree123 |
| Dependent | m.cruz@ibts.local | dependent123 |

(The login page also lists these under "Demo accounts".)

## Suggested walkthrough (~8 min)

### 1. Admin — the full picture (login: admin123)
- **Dashboard**: profile hero, service-years chart, promotion timeline,
  benefits summary, and the action-required feed.
- **Personnel**: click **Add Account** → create an Officer (rank + service
  years) or a Dependent (relationship + sponsor). The new record appears in the
  table immediately. Click **Edit** on any row to change rank/status.
- **Claims**: open a *submitted* claim → **Start Review** (watch the toast and
  the status flip to under review) → **Proceed to Decision** → Approve/Reject.
- **Financial**: KPI cards + charts (committed amount by type, claims by
  status). Click **Export CSV** to download a report.
- **Audit Log**: every action above (account created, review started, decision,
  export) is recorded here.

### 2. HR Manager — approve, but read-only reporting (login: hr123)
- Same claims powers as admin (review + decide).
- **Financial** and **Audit** are **read-only** — note there's no Export button.

### 3. Officer — request a claim (login: officer123)
- Sidebar is trimmed to what officers can see.
- **Claims** is titled **My Claims** — only their own claims show.
- Click **New Claim Request** → pick a benefit → submit. Then log back in as
  admin/HR to see it appear in the full claims list.

### 4. Retiree (login: retiree123)
- Dashboard is retirement-focused; can view the Retirees directory and submit
  claims for their own benefits.

### 5. Dependent — verification focus (login: dependent123)
- A slimmed dashboard: **verification status**, required documents, sponsor,
  and beneficiary insurance benefits.
- Click **Request Re-verification** to resubmit — this notifies admins.

## Things to point out
- **Role-based access**: the sidebar and action buttons change per role
  (Role-Based View Matrix, SSOT §2.4).
- **Realistic states**: the mock API adds latency and a ~5% random error rate,
  so you'll occasionally see loading skeletons, empty states, and error/retry
  UI — that's intentional.
- **Global search** (header): role-scoped; try searching a name or claim id.
- **Settings**: edit profile, change password (works on next login), view
  account details.
- **Theme**: light/dark toggle in the header.

## Persistence & reset
Mock data now persists in the browser (localStorage), so changes — new claim
requests, decisions, created accounts, notifications — **survive reloads and
logout/login**. This is what lets an officer submit a claim and an admin see it
after switching accounts.

To reset back to the seeded demo data, clear the site's localStorage (DevTools →
Application → Local Storage → delete the `ibts-mock-db:1` key) and reload.
