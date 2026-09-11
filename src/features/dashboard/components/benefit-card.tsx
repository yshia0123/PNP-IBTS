import { HeartPulse, PiggyBank, ShieldCheck, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  benefitStatusLabel,
  benefitStatusVariant,
  formatCurrency,
  formatDate,
} from "@/lib/format";
import type { Benefit } from "@/lib/types";

/**
 * BenefitCard (SSOT Section 2.2, Phase 2 step 7).
 * Presentational summary card, color-coded by status. Three variants map to
 * the three benefit types shown in the summary grid.
 */
const TYPE_META: Record<
  Benefit["type"],
  { title: string; icon: LucideIcon }
> = {
  active_benefit: { title: "Active Benefits", icon: HeartPulse },
  retirement: { title: "Retirement Track", icon: PiggyBank },
  insurance: { title: "Insurance & Death Benefits", icon: ShieldCheck },
};

export function BenefitCard({
  type,
  benefit,
}: {
  type: Benefit["type"];
  benefit?: Benefit;
}) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              {meta.title}
            </h3>
          </div>
          {benefit && (
            <Badge variant={benefitStatusVariant(benefit.status)}>
              {benefitStatusLabel(benefit.status)}
            </Badge>
          )}
        </div>

        {benefit ? (
          <div className="mt-4 space-y-1">
            <p
              className="truncate text-sm text-muted-foreground"
              title={benefit.label}
            >
              {benefit.label}
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(benefit.amount)}
            </p>
            <p className="text-xs text-muted-foreground">
              Effective {formatDate(benefit.effectiveDate)}
              {benefit.expiryDate
                ? ` · Expires ${formatDate(benefit.expiryDate)}`
                : ""}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No {meta.title.toLowerCase()} on record.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
