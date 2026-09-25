"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompensationProfileInputs } from "@/lib/compensation";

/**
 * CompensationEditor — the Admin-editable situational inputs for one person.
 * These are the only values persisted; everything else is computed on read.
 * When `readOnly` (HR), every control is disabled but still visible for
 * context. Reports the full next inputs object up on any change.
 */
export function CompensationEditor({
  inputs,
  onChange,
  payslipAccountNo,
  onPayslipChange,
  readOnly = false,
}: {
  inputs: CompensationProfileInputs;
  onChange: (next: CompensationProfileInputs) => void;
  payslipAccountNo: string;
  onPayslipChange: (value: string) => void;
  readOnly?: boolean;
}) {
  const set = <K extends keyof CompensationProfileInputs>(
    key: K,
    value: CompensationProfileInputs[K]
  ) => onChange({ ...inputs, [key]: value });

  return (
    <fieldset disabled={readOnly} aria-disabled={readOnly} className="space-y-6">
      {/* Payslip account */}
      <Card>
        <CardHeader>
          <CardTitle>Payslip Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <label
              htmlFor="payslipAccountNo"
              className="text-xs font-medium text-muted-foreground"
            >
              Payslip Account No.
            </label>
            <input
              id="payslipAccountNo"
              type="text"
              inputMode="numeric"
              value={payslipAccountNo}
              onChange={(e) => onPayslipChange(e.target.value)}
              placeholder="e.g. 2000070066"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </CardContent>
      </Card>

      {/* Duty-based & collateral pay */}
      <Card>
        <CardHeader>
          <CardTitle>Duty-Based &amp; Collateral Pay</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PercentField
            id="hazardousDutyPct"
            label="Hazardous Duty Pay (% of base, max 50%)"
            value={inputs.hazardousDutyPct}
            max={50}
            onChange={(v) => set("hazardousDutyPct", v)}
          />
          <PercentField
            id="hardshipPct"
            label="Hardship / Remote (% of base, 10–25%)"
            value={inputs.hardshipPct}
            max={25}
            onChange={(v) => set("hardshipPct", v)}
          />
          <div className="flex items-center gap-2 pt-6">
            <input
              id="combatDuty"
              type="checkbox"
              checked={!!inputs.combatDuty}
              onChange={(e) => set("combatDuty", e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="combatDuty" className="text-sm text-foreground">
              Combat Duty Pay (₱3,000/mo)
            </label>
          </div>
          <NumberField
            id="combatIncentiveDays"
            label="Combat Incentive Days (₱300/day)"
            value={inputs.combatIncentiveDays}
            onChange={(v) => set("combatIncentiveDays", v)}
          />
        </CardContent>
      </Card>

      {/* Other monthly allowances */}
      <Card>
        <CardHeader>
          <CardTitle>Other Monthly Allowances</CardTitle>
          <p className="text-xs text-muted-foreground">
            PERA (₱2,000) and Hazard Pay (₱540) are fixed and applied
            automatically.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PesoField
            id="clothingAllowance"
            label="Clothing / Uniform Allowance"
            value={inputs.clothingAllowance}
            onChange={(v) => set("clothingAllowance", v)}
          />
          <PesoField
            id="laundryAllowance"
            label="Laundry Allowance"
            value={inputs.laundryAllowance}
            onChange={(v) => set("laundryAllowance", v)}
          />
          <PesoField
            id="trainingSubsistence"
            label="Training Subsistence"
            value={inputs.trainingSubsistence}
            onChange={(v) => set("trainingSubsistence", v)}
          />
        </CardContent>
      </Card>
    </fieldset>
  );
}

/* ---- field primitives ---- */

function PesoField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₱
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
          className="w-full rounded-md border border-border bg-surface py-2 pl-7 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)] disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}

/** Percent field: stores a fraction (0–1) but displays whole percent. */
function PercentField({
  id,
  label,
  value,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number | null | undefined;
  max: number;
  onChange: (v: number) => void;
}) {
  const displayed = value != null ? Math.round(value * 100) : 0;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          value={displayed}
          onChange={(e) => {
            const pct = e.target.value === "" ? 0 : Number(e.target.value);
            onChange(Math.min(max, Math.max(0, pct)) / 100);
          }}
          className="w-full rounded-md border border-border bg-surface py-2 pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number | null | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value ?? 0}
        onChange={(e) =>
          onChange(e.target.value === "" ? 0 : Number(e.target.value))
        }
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}
