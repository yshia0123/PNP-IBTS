"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPeso } from "@/lib/format";
import { type CalComputation, DBM_CAL_CONSTANT } from "@/lib/compensation";

/**
 * CALCalculatorPanel — Commutation of Accumulated Leave calculator. Two
 * numeric inputs + live-computed breakdown. Always enabled regardless of the
 * selected rank (the CAL formula is identical for every rank, including NUP).
 *
 * Controlled component: the parent owns the raw input strings (kept as strings
 * so we can show inline validation for non-numeric / negative entries without
 * crashing the calculation) and passes the derived computation in. This keeps
 * the payout available to the summary card without a setState-in-effect.
 */

export function CALCalculatorPanel({
  grossRaw,
  yearsRaw,
  onGrossChange,
  onYearsChange,
  grossInvalid,
  yearsInvalid,
  result,
}: {
  grossRaw: string;
  yearsRaw: string;
  onGrossChange: (v: string) => void;
  onYearsChange: (v: string) => void;
  grossInvalid: boolean;
  yearsInvalid: boolean;
  /** Computed breakdown, or null when inputs are blank/invalid. */
  result: CalComputation | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CAL Calculator</CardTitle>
        <p className="text-xs text-muted-foreground">
          Commutation of Accumulated Leave — applies to every rank, including
          NUP.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            id="cal-gross-credits"
            label="Gross Leave Credits Earned (days)"
            value={grossRaw}
            onChange={onGrossChange}
            invalid={grossInvalid}
            error="Enter a valid non-negative number."
          />
          <NumberField
            id="cal-years-service"
            label="Years of Active Service"
            value={yearsRaw}
            onChange={onYearsChange}
            invalid={yearsInvalid}
            error="Enter a valid non-negative number."
          />
        </div>

        <dl className="space-y-2 rounded-md border border-border bg-muted/30 p-4 text-sm">
          <Row
            label="Mandatory Leave Deduction (Years × 5)"
            value={result ? `${result.mandatoryDeduction} days` : "—"}
          />
          <Row
            label="Net Leave Credits"
            value={result ? `${result.netLeaveCredits} days` : "—"}
          />
          <Row
            label="CAL Payout"
            value={result ? formatPeso(result.payout) : "—"}
            strong
          />
        </dl>

        {result?.belowMandatory && (
          <p
            role="alert"
            className="rounded-md border border-[var(--warning-500)]/40 bg-[var(--warning-500)]/10 px-3 py-2 text-xs text-warning"
          >
            Gross Leave Credits are below the Mandatory Leave Deduction. Net
            Leave Credits are clamped to 0, so the CAL Payout is ₱0.00.
          </p>
        )}

        <p className="text-[11px] text-muted-foreground">
          Formula: (Base Pay + Longevity Pay) × Net Leave Credits ×{" "}
          {DBM_CAL_CONSTANT} (DBM constant)
        </p>
      </CardContent>
    </Card>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  invalid,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
  error: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)] aria-[invalid=true]:border-[var(--danger-500)]"
      />
      {invalid && (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          strong
            ? "font-semibold text-foreground"
            : "font-medium text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
