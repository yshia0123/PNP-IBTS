"use client";

import { useSessionStore } from "@/lib/stores/session-store";
import { ProfileHeroCard } from "./components/profile-hero-card";
import { PerformanceBenefitsPortfolio } from "./components/performance-benefits-portfolio";
import { BenefitsSummaryGrid } from "./components/benefits-summary-grid";
import { ActionRequiredFeed } from "./components/action-required-feed";
import { DependentDashboard } from "./components/dependent-dashboard";
import { useMyBenefits, useMyPersonnel } from "./hooks";

/**
 * DashboardPage (SmartContainer) — SSOT Section 2.2.
 * Dependents get a verification-focused view (Section 2.4); every other role
 * gets the personnel service + benefits portfolio.
 */
export function DashboardPage() {
  const currentUser = useSessionStore((s) => s.currentUser);
  const isDependent = currentUser?.role === "dependent";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isDependent
            ? `Welcome, ${currentUser?.name}. Here's your verification and beneficiary status.`
            : `Welcome, ${currentUser?.name}. Here's your overview.`}
        </p>
      </div>

      {isDependent ? (
        <>
          <DependentDashboard />
          <ActionRequiredFeed />
        </>
      ) : (
        <PersonnelDashboard />
      )}
    </div>
  );
}

/** Service + benefits dashboard for personnel-backed roles. */
function PersonnelDashboard() {
  const personnelQuery = useMyPersonnel();
  const benefitsQuery = useMyBenefits();

  return (
    <>
      <ProfileHeroCard
        personnel={personnelQuery.data ?? undefined}
        isLoading={personnelQuery.isLoading}
        isError={personnelQuery.isError}
        onRetry={() => personnelQuery.refetch()}
      />

      <PerformanceBenefitsPortfolio
        personnel={personnelQuery.data ?? undefined}
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
    </>
  );
}
