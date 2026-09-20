import type { BenefitStatus } from "@/lib/types";

/** Human-readable label for a benefit status. */
export function benefitStatusLabel(status: BenefitStatus): string {
  const map: Record<BenefitStatus, string> = {
    active: "Active",
    pending: "Pending",
    suspended: "Suspended",
    expired: "Expired",
  };
  return map[status];
}

/** Badge variant for a benefit status (colors per SSOT Section 2.3). */
export function benefitStatusVariant(
  status: BenefitStatus
): "success" | "warning" | "danger" | "neutral" {
  const map: Record<
    BenefitStatus,
    "success" | "warning" | "danger" | "neutral"
  > = {
    active: "success",
    pending: "warning",
    suspended: "danger",
    expired: "neutral",
  };
  return map[status];
}

/** Format a number as PHP currency; returns an em dash for undefined. */
export function formatCurrency(amount?: number): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format an ISO date string as e.g. "Jan 10, 2021". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format an ISO timestamp as e.g. "Aug 29, 2026, 9:15 AM". */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a number as PHP currency with the ₱ symbol, thousands separators, and
 * exactly 2 decimal places (e.g. ₱20,000.00). Used across the Salary &
 * Compensation module where cent-level precision matters, unlike the
 * whole-peso `formatCurrency` used for high-level benefit summaries.
 */
export function formatPeso(amount?: number | null): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `₱${new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

/**
 * Whole years of service between a join date and an end date.
 *
 * - Active personnel: end date is "today" (real-time), so the figure grows
 *   automatically over time.
 * - Retired / separated personnel: end date is their last day of service
 *   (separationDate). Falls back to today if a separation date is missing.
 *
 * Returns a non-negative whole number (completed years). Invalid/blank join
 * dates yield 0.
 */
export function computeServiceYears(
  joinDate: string | null | undefined,
  separationDate?: string | null
): number {
  if (!joinDate) return 0;
  const start = new Date(joinDate);
  if (Number.isNaN(start.getTime())) return 0;

  const end =
    separationDate && !Number.isNaN(new Date(separationDate).getTime())
      ? new Date(separationDate)
      : new Date();

  let years = end.getFullYear() - start.getFullYear();
  // Subtract a year if the anniversary hasn't occurred yet this year.
  const monthDiff = end.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) {
    years -= 1;
  }
  return Math.max(0, years);
}
