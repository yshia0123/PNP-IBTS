import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BenefitCard } from "./benefit-card";
import type { Benefit } from "@/lib/types";
import type { ComputedCompensation } from "@/lib/compensation";

/**
 * BenefitsSummaryGrid (SSOT Section 2.2, Phase 2 step 7).
 * Three-card grid: Active Benefits | Retirement Track | Insurance.
 * Presentational — benefits + states passed in.
 *
 * Linked to Computed Compensation: when a `computed` profile is available, each
 * card also surfaces the matching live figure, so the summary reflects the
 * computation and updates when the Admin saves an edit.
 */
const ORDER: Benefit["type"][] = ["active_benefit", "retirement", "insurance"];

/** Map a benefit type to its matching computed figure + label. */
function computedFor(
  type: Benefit["type"],
  computed?: ComputedCompensation
): { label: string; amount: number } | undefined {
  if (!computed) return undefined;
  switch (type) {
    case "active_benefit":
      return { label: "Total Monthly Gross", amount: computed.totalMonthly };
    case "retirement":
      return {
        label: `Retirement Pension (${Math.round(computed.pension.retirementRate * 100)}% of base, monthly)`,
        amount: computed.pension.retirementMonthly,
      };
    case "insurance":
      return {
        label: "Survivor Pension (monthly)",
        amount: computed.pension.survivorMonthly,
      };
  }
}

interface Props {
  benefits?: Benefit[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  /** Computed compensation profile for the same person, when available. */
  computed?: ComputedCompensation;
}

export function BenefitsSummaryGrid({
  benefits,
  isLoading,
  isError,
  onRetry,
  computed,
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
          computed={computedFor(type, computed)}
        />
      ))}
    </div>
  );
}
