"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPeso, formatDate } from "@/lib/format";
import type { ComputedCompensation } from "@/lib/compensation";
import type { Personnel } from "@/lib/types";

// Status → badge color, matching the Personnel list (green active, blue retired).
const STATUS_VARIANT: Record<Personnel["status"], "success" | "info" | "neutral"> = {
  active: "success",
  retired: "info",
  separated: "neutral",
};

/**
 * ComputedBreakdown — read-only roll-up of the fully computed profile: monthly
 * line items, annual bonuses, and the pension estimate. Recomputes live as the
 * editor changes (the parent passes a fresh `computed`).
 */
export function ComputedBreakdown({
  computed,
  personName,
  rank,
  salaryGrade,
  status,
  joinDate,
  separationDate,
  serviceYears,
}: {
  computed: ComputedCompensation;
  personName: string;
  rank: string;
  salaryGrade: number;
  status: Personnel["status"];
  joinDate: string;
  separationDate?: string;
  serviceYears: number;
}) {
  const { monthly, annual, totalMonthly, totalAnnual, pension } = computed;
  const nonZeroMonthly = monthly.filter((i) => i.amount !== 0);
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle>Computed Compensation</CardTitle>
            <Badge variant={STATUS_VARIANT[status]}>{statusLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* All personnel details in one rectangle. Name + rank-derived +
              service dates. Status is omitted here — the badge above shows it. */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-4 rounded-md border border-border bg-muted/30 p-4 text-left">
            <div className="col-span-3">
              <p className="text-[11px] text-muted-foreground">Name</p>
              <p className="text-lg font-semibold text-foreground">
                {personName}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Rank</p>
              <p className="text-sm font-semibold text-foreground">{rank}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Salary Grade</p>
              <p className="text-sm font-semibold text-foreground">
                {salaryGrade || "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Base Pay</p>
              <p className="text-sm font-semibold text-foreground">
                {formatPeso(computed.basePay)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Date Joined</p>
              <p className="text-sm font-semibold text-foreground">
                {formatDate(joinDate)}
              </p>
            </div>
            {separationDate && (
              <div>
                <p className="text-[11px] text-muted-foreground">Last Day</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(separationDate)}
                </p>
              </div>
            )}
            <div>
              <p className="text-[11px] text-muted-foreground">Years of Service</p>
              <p className="text-sm font-semibold text-foreground">
                {serviceYears} yrs
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Monthly
            </h4>
            <dl className="space-y-1.5 text-sm">
              {nonZeroMonthly.map((item) => (
                <Row key={item.key} label={item.label} value={item.amount} />
              ))}
              <div className="mt-2 border-t border-border pt-2">
                <Row label="Total Monthly Gross" value={totalMonthly} strong />
              </div>
            </dl>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Annual Bonuses
            </h4>
            <dl className="space-y-1.5 text-sm">
              {annual.map((item) => (
                <Row key={item.key} label={item.label} value={item.amount} />
              ))}
              <div className="mt-2 border-t border-border pt-2">
                <Row label="Total Annual Bonuses" value={totalAnnual} strong />
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retirement &amp; Survivor Estimate</CardTitle>
          <p className="text-xs text-muted-foreground">
            {pension.retirementEligible
              ? "Eligible for retirement (20+ years of service)."
              : "Not yet eligible — figures shown are baseline projections."}
          </p>
        </CardHeader>
        <CardContent>
          <dl className="space-y-1.5 text-sm">
            <Row
              label={`Retirement Pension (${Math.round(pension.retirementRate * 100)}% of base, monthly)`}
              value={pension.retirementMonthly}
            />
            <Row
              label="Permanent Disability — upfront (1 yr salary)"
              value={pension.disabilityUpfront}
            />
            <Row
              label="Permanent Disability — lifetime monthly (80%)"
              value={pension.disabilityMonthly}
            />
            <Row
              label="Survivor Pension (monthly, 50%)"
              value={pension.survivorMonthly}
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={strong ? "font-medium text-foreground" : "text-muted-foreground"}>
        {label}
      </dt>
      <dd
        className={
          strong
            ? "text-base font-semibold text-foreground"
            : "font-medium text-foreground"
        }
      >
        {formatPeso(value)}
      </dd>
    </div>
  );
}
