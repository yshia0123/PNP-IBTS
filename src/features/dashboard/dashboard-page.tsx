"use client";

import { ProfileHeroCard } from "./components/profile-hero-card";
import { PerformanceBenefitsPortfolio } from "./components/performance-benefits-portfolio";
import { BenefitsSummaryGrid } from "./components/benefits-summary-grid";
import { ActionRequiredFeed } from "./components/action-required-feed";
import { useMyBenefits, useMyPersonnel } from "./hooks";

/**
 * DashboardPage (SmartContainer) — SSOT Section 2.2, Phase 2.
 * Owns the personnel + benefits queries and passes data/states down to
 * presentational components. The ActionRequiredFeed owns its own query.
 */
export function DashboardPage() {
  const personnelQuery = useMyPersonnel();
  const benefitsQuery = useMyBenefits();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Service history, benefits portfolio, and items needing attention.
        </p>
      </div>

      <ProfileHeroCard
        personnel={personnelQuery.data}
        isLoading={personnelQuery.isLoading}
        isError={personnelQuery.isError}
        onRetry={() => personnelQuery.refetch()}
      />

      <PerformanceBenefitsPortfolio
        personnel={personnelQuery.data}
        isLoading={personnelQuery.isLoading}
        isError={personnelQuery.isError}
      />

      <section aria-label="Benefits summary">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Benefits Summary
        </h2>
        <BenefitsSummaryGrid
          benefits={benefitsQuery.data}
          isLoading={benefitsQuery.isLoading}
          isError={benefitsQuery.isError}
          onRetry={() => benefitsQuery.refetch()}
        />
      </section>

      <ActionRequiredFeed />
    </div>
  );
}
