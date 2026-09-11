import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BenefitCard } from "./benefit-card";
import type { Benefit } from "@/lib/types";

/**
 * BenefitsSummaryGrid (SSOT Section 2.2, Phase 2 step 7).
 * Three-card grid: Active Benefits | Retirement Track | Insurance.
 * Presentational — benefits + states passed in.
 */
const ORDER: Benefit["type"][] = ["active_benefit", "retirement", "insurance"];

interface Props {
  benefits?: Benefit[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function BenefitsSummaryGrid({
  benefits,
  isLoading,
  isError,
  onRetry,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ORDER.map((type) => (
          <Card key={type}>
            <CardContent className="space-y-3 pt-5">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-danger">Couldn&apos;t load benefits.</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Retry
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {ORDER.map((type) => (
        <BenefitCard
          key={type}
          type={type}
          benefit={benefits?.find((b) => b.type === type)}
        />
      ))}
    </div>
  );
}
