/**
 * Dashboard route (SSOT Section 2.2 — DashboardPage).
 * Phase 1 is shell + tooling only, so this is a placeholder. Dashboard
 * content (ProfileHeroCard, PerformanceBenefitsPortfolio, BenefitsSummaryGrid,
 * ActionRequiredFeed) is built in Phase 2.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Shell scaffold is in place. Dashboard widgets arrive in Phase 2.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Phase 1 complete — Header, Sidebar (collapsible), and Status Bar are
          wired up, with MSW intercepting the health check below the fold.
        </p>
      </div>
    </div>
  );
}
