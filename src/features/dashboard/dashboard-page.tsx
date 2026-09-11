"use client";

import { useSessionStore } from "@/lib/stores/session-store";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeroCard } from "./components/profile-hero-card";
import { PerformanceBenefitsPortfolio } from "./components/performance-benefits-portfolio";
import { BenefitsSummaryGrid } from "./components/benefits-summary-grid";
import { ActionRequiredFeed } from "./components/action-required-feed";
import { useMyBenefits, useMyPersonnel } from "./hooks";

/**
 * DashboardPage (SmartContainer) — SSOT Section 2.2, Phase 2.
 * Owns the personnel + benefits queries and passes data/states down.
 * When the current role has no personnel record (e.g. a dependent), it shows
 * a role-appropriate welcome instead of the service portfolio.
 */
export function DashboardPage() {
  const currentUser = useSessionStore((s) => s.currentUser);
  const personnelQuery = useMyPersonnel();
  const benefitsQuery = useMyBenefits();

  const hasPersonnel =
    !personnelQuery.isLoading &&
    !personnelQuery.isError &&
    personnelQuery.data != null;
  const noPersonnelRecord =
    !personnelQuery.isLoading &&
    !personnelQuery.isError &&
    personnelQuery.data == null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome, {currentUser.name}. Here&apos;s your overview.
        </p>
      </div>

      {noPersonnelRecord ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-foreground">
              No service record linked to this account.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              As a {currentUser.role.replace("_", " ")}, your view focuses on
              verification requests and beneficiary status. Use the sidebar to
              access the modules available to you.
            </p>
          </CardContent>
        </Card>
      ) : (
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
        </>
      )}

      {hasPersonnel || noPersonnelRecord ? <ActionRequiredFeed /> : null}
    </div>
  );
}
