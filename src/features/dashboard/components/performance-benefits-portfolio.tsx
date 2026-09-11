import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceYearsChart } from "./service-years-chart";
import { PromotionHistoryTimeline } from "./promotion-history-timeline";
import type { DashboardPersonnel } from "../api";

/**
 * PerformanceBenefitsPortfolio (SSOT Section 2.2, Phase 2 step 6).
 * Composes ServiceYearsChart + PromotionHistoryTimeline. Presentational.
 */
interface Props {
  personnel?: DashboardPersonnel;
  isLoading: boolean;
  isError: boolean;
}

export function PerformanceBenefitsPortfolio({
  personnel,
  isLoading,
  isError,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance &amp; Benefits Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Service Years
          </p>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : isError || !personnel ? (
            <div className="flex h-56 items-center justify-center text-sm text-danger">
              Couldn&apos;t load the service chart.
            </div>
          ) : (
            <ServiceYearsChart personnel={personnel} />
          )}
        </div>
        <div className="lg:col-span-2">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Promotion History
          </p>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-40" />
            </div>
          ) : isError || !personnel ? (
            <p className="text-sm text-danger">Couldn&apos;t load history.</p>
          ) : (
            <PromotionHistoryTimeline history={personnel.promotionHistory} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
