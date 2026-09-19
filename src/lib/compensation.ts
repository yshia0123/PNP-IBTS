/**
 * Salary & Compensation domain logic (Base Pay & Compensation module).
 *
 * Pure, framework-free calculation helpers so they can be unit-tested and
 * reused by any UI component. All rules apply UNIFORMLY to every rank,
 * including NUP (Non-Uniformed Personnel) — there is deliberately no
 * rank-specific branching anywhere in this file.
 */

/**
 * DBM (Department of Budget and Management) commutation factor used in the CAL
 * payout formula. Defined as a named constant so a future DBM revision is a
 * one-line change rather than hunting for a magic number.
 */
export const DBM_CAL_CONSTANT = 0.0481927;

/**
 * Longevity Pay tiers, applied to ALL ranks (including NUP). `rate` is a
 * fraction of Base Pay; `years` is the service threshold for the tier.
 */
export interface LpTier {
  label: string;
  years: number;
  rate: number;
}

export const LP_TIERS: readonly LpTier[] = [
  { label: "None", years: 0, rate: 0 },
  { label: "1st LP (10%) - 5 Years", years: 5, rate: 0.1 },
  { label: "2nd LP (21%) - 10 Years", years: 10, rate: 0.21 },
  { label: "3rd LP (33.10%) - 15 Years", years: 15, rate: 0.331 },
  { label: "4th LP (46.41%) - 20 Years", years: 20, rate: 0.4641 },
  { label: "5th LP (50%) - 25+ Years", years: 25, rate: 0.5 },
] as const;

/** LP Amount = Base Pay × selected tier's rate. */
export function longevityPayAmount(basePay: number, rate: number): number {
  return basePay * rate;
}

/** Total Monthly Base Compensation = Base Pay + LP Amount. */
export function totalMonthlyBaseCompensation(
  basePay: number,
  lpAmount: number
): number {
  return basePay + lpAmount;
}

/** Number of leave days deducted as mandatory: Years of Active Service × 5. */
export function mandatoryLeaveDeduction(yearsOfActiveService: number): number {
  return yearsOfActiveService * 5;
}

/**
 * Net Leave Credits = Gross − Mandatory Deduction, clamped at 0 so a payout is
 * never computed against a negative credit balance.
 */
export function netLeaveCredits(
  grossLeaveCredits: number,
  yearsOfActiveService: number
): number {
  const net =
    grossLeaveCredits - mandatoryLeaveDeduction(yearsOfActiveService);
  return Math.max(0, net);
}

/**
 * CAL (Commutation of Accumulated Leave) Payout.
 * = (Base Pay + Longevity Pay) × Net Leave Credits × DBM_CAL_CONSTANT
 */
export function calPayout(
  basePay: number,
  longevityPay: number,
  netCredits: number
): number {
  return (basePay + longevityPay) * netCredits * DBM_CAL_CONSTANT;
}

/** Result bundle for a full CAL computation, plus a validation flag. */
export interface CalComputation {
  mandatoryDeduction: number;
  netLeaveCredits: number;
  payout: number;
  /** True when gross credits are below the mandatory deduction (clamped). */
  belowMandatory: boolean;
}

/**
 * Compute the full CAL breakdown from validated numeric inputs. Callers are
 * responsible for rejecting non-numeric / negative raw input before calling.
 */
export function computeCal(params: {
  basePay: number;
  longevityPay: number;
  grossLeaveCredits: number;
  yearsOfActiveService: number;
}): CalComputation {
  const { basePay, longevityPay, grossLeaveCredits, yearsOfActiveService } =
    params;
  const mandatoryDeduction = mandatoryLeaveDeduction(yearsOfActiveService);
  const net = netLeaveCredits(grossLeaveCredits, yearsOfActiveService);
  return {
    mandatoryDeduction,
    netLeaveCredits: net,
    payout: calPayout(basePay, longevityPay, net),
    belowMandatory: grossLeaveCredits < mandatoryDeduction,
  };
}

/* ------------------------------------------------------------------ *
 * Per-person compensation catalog
 *
 * Everything below powers the per-person editing tool: given a rank's Base
 * Pay, the person's years of service, and the situational inputs an Admin
 * enters, it derives a full compensation profile. Auto-computed values are
 * NEVER stored — only the Admin's manual inputs are persisted (see
 * CompensationProfileInputs). All rules apply uniformly to every rank,
 * including NUP.
 * ------------------------------------------------------------------ */

/** Fixed monetary constants (PHP), kept named so revisions are one-liners. */
export const CASH_GIFT = 5000; // Year-End cash gift
export const PEI_AMOUNT = 5000; // Productivity Enhancement Incentive (annual)
export const PERA_AMOUNT = 2000; // Personnel Economic Relief Allowance (monthly)
export const HAZARD_PAY = 540; // fixed monthly law-enforcement hazard pay
export const COMBAT_DUTY_PAY = 3000; // monthly, when actively field-assigned
export const COMBAT_INCENTIVE_PER_DAY = 300; // per engagement day
export const SUBSISTENCE_NCO_MONTHLY = 10500; // ₱350/day
export const SUBSISTENCE_COMMISSIONED_MONTHLY = 4500; // ₱150/day

/** Longevity Pay cap: compounds +10% per 5 years, never above 50%. */
export const LP_MAX_RATE = 0.5;

/**
 * Subsistence class. Commissioned officers (PLT and above, SG 22+) get the
 * lower ₱150/day rate; NCOs (PEMS down to Pat) get ₱350/day. NUP defaults to
 * the NCO rate but the Admin can override the class per person.
 */
export type SubsistenceClass = "nco" | "commissioned";

const COMMISSIONED_RANKS = new Set([
  "PGEN",
  "PLTGEN",
  "PMGEN",
  "PBGEN",
  "PCOL",
  "PLTCOL",
  "PMAJ",
  "PCPT",
  "PLT",
]);

/** Default subsistence class inferred from rank (NUP → NCO by default). */
export function defaultSubsistenceClass(rank: string): SubsistenceClass {
  return COMMISSIONED_RANKS.has(rank) ? "commissioned" : "nco";
}

export function subsistenceAmount(cls: SubsistenceClass): number {
  return cls === "commissioned"
    ? SUBSISTENCE_COMMISSIONED_MONTHLY
    : SUBSISTENCE_NCO_MONTHLY;
}

/**
 * Longevity Pay rate derived from years of active service: +10% compounding
 * every completed 5 years, capped at 50%. e.g. 5y → 10%, 10y → 21%,
 * 15y → 33.1%, 20y → 46.41%, 25y+ → 50% (cap).
 */
export function lpRateForYears(yearsOfActiveService: number): number {
  const steps = Math.floor(Math.max(0, yearsOfActiveService) / 5);
  if (steps <= 0) return 0;
  const compounded = Math.pow(1.1, steps) - 1;
  return Math.min(LP_MAX_RATE, compounded);
}

/**
 * The Admin-editable, PERSISTED situational inputs. These are the only fields
 * stored on the personnel row (as a `compensation` jsonb blob). Everything
 * else is derived on read.
 */
export interface CompensationProfileInputs {
  /** Hazardous Duty Pay as a fraction of base pay (0–0.5). */
  hazardousDutyPct?: number | null;
  /** Whether the person is actively assigned to field combat operations. */
  combatDuty?: boolean | null;
  /** Combat Incentive engagement days in the period. */
  combatIncentiveDays?: number | null;
  /** Hardship / remote-assignment allowance as a fraction of base pay (0.10–0.25). */
  hardshipPct?: number | null;
  /** Clothing / uniform maintenance allowance (monthly ₱). */
  clothingAllowance?: number | null;
  /** Laundry allowance (monthly ₱). */
  laundryAllowance?: number | null;
  /** Training subsistence (monthly ₱, situational). */
  trainingSubsistence?: number | null;
}

/** Sensible empty defaults for a person with no saved compensation yet. */
export const EMPTY_COMPENSATION_INPUTS: CompensationProfileInputs = {
  hazardousDutyPct: 0,
  combatDuty: false,
  combatIncentiveDays: 0,
  hardshipPct: 0,
  clothingAllowance: 200, // ₱200/month standard
  laundryAllowance: 150,
  trainingSubsistence: 0,
};

/** A single computed line item for display. */
export interface CompLineItem {
  key: string;
  label: string;
  amount: number;
  /** "monthly" recurs; "annual" is a once-a-year figure. */
  cadence: "monthly" | "annual";
}

/** Retirement / disability / death pension ESTIMATES (not monthly payroll). */
export interface PensionEstimate {
  /** Compulsory/optional retirement monthly pension rate as % of final base. */
  retirementRate: number;
  retirementMonthly: number;
  /** Permanent disability: 1 year full salary upfront + 80% lifetime monthly. */
  disabilityUpfront: number;
  disabilityMonthly: number;
  /** Survivor pension (mirrors 50% baseline of final base pay). */
  survivorMonthly: number;
  /** True once the person meets the 20-year service threshold. */
  retirementEligible: boolean;
}

export interface ComputedCompensation {
  basePay: number;
  lpRate: number;
  lpAmount: number;
  subsistenceClass: SubsistenceClass;
  /** Recurring monthly items (base + allowances + duty pay). */
  monthly: CompLineItem[];
  /** Annual bonuses. */
  annual: CompLineItem[];
  /** Sum of every monthly line item (gross monthly pay). */
  totalMonthly: number;
  /** Sum of every annual bonus. */
  totalAnnual: number;
  pension: PensionEstimate;
}

function n(v: number | null | undefined): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

/**
 * Retirement pension: starts at 50% of final base pay at 20 years, +2.5% for
 * each additional year served. Capped at 100%.
 */
export function retirementRate(yearsOfActiveService: number): number {
  if (yearsOfActiveService < 20) return 0.5; // baseline shown pre-eligibility
  const extra = (yearsOfActiveService - 20) * 0.025;
  return Math.min(1, 0.5 + extra);
}

/**
 * Aggregate a full computed compensation profile from a rank's table base pay,
 * the person's years of service, and the Admin's situational inputs.
 */
export function computeCompensationProfile(params: {
  rank: string;
  tableBasePay: number;
  yearsOfActiveService: number;
  inputs: CompensationProfileInputs;
}): ComputedCompensation {
  const { rank, tableBasePay, yearsOfActiveService, inputs } = params;

  // Base Pay always comes from the rank's table value — it is never overridden
  // and follows the person's current rank (so promotions flow through).
  const basePay = tableBasePay;

  const lpRate = lpRateForYears(yearsOfActiveService);
  const lpAmount = longevityPayAmount(basePay, lpRate);

  // Subsistence class is always derived from the current rank.
  const subsistenceClass = defaultSubsistenceClass(rank);
  const subsistence = subsistenceAmount(subsistenceClass);

  const hazardousDuty = basePay * Math.min(0.5, Math.max(0, n(inputs.hazardousDutyPct)));
  const hardship = basePay * Math.min(0.25, Math.max(0, n(inputs.hardshipPct)));
  const combatDuty = inputs.combatDuty ? COMBAT_DUTY_PAY : 0;
  const combatIncentive =
    Math.max(0, n(inputs.combatIncentiveDays)) * COMBAT_INCENTIVE_PER_DAY;

  const monthly: CompLineItem[] = [
    { key: "basePay", label: "Base Pay", amount: basePay, cadence: "monthly" },
    { key: "lp", label: "Longevity Pay", amount: lpAmount, cadence: "monthly" },
    {
      key: "subsistence",
      label: `Subsistence Allowance (${subsistenceClass === "commissioned" ? "Commissioned" : "NCO"})`,
      amount: subsistence,
      cadence: "monthly",
    },
    { key: "pera", label: "PERA", amount: PERA_AMOUNT, cadence: "monthly" },
    { key: "hazardPay", label: "Hazard Pay", amount: HAZARD_PAY, cadence: "monthly" },
    {
      key: "clothing",
      label: "Clothing / Uniform Allowance",
      amount: n(inputs.clothingAllowance),
      cadence: "monthly",
    },
    {
      key: "laundry",
      label: "Laundry Allowance",
      amount: n(inputs.laundryAllowance),
      cadence: "monthly",
    },
    {
      key: "hazardousDuty",
      label: "Hazardous Duty Pay",
      amount: hazardousDuty,
      cadence: "monthly",
    },
    {
      key: "combatDuty",
      label: "Combat Duty Pay",
      amount: combatDuty,
      cadence: "monthly",
    },
    {
      key: "combatIncentive",
      label: "Combat Incentive Pay",
      amount: combatIncentive,
      cadence: "monthly",
    },
    {
      key: "hardship",
      label: "Hardship / Remote Assignment",
      amount: hardship,
      cadence: "monthly",
    },
    {
      key: "training",
      label: "Training Subsistence",
      amount: n(inputs.trainingSubsistence),
      cadence: "monthly",
    },
  ];

  const annual: CompLineItem[] = [
    { key: "midYear", label: "Mid-Year Bonus (1× base)", amount: basePay, cadence: "annual" },
    {
      key: "yearEnd",
      label: "Year-End Bonus (1× base)",
      amount: basePay,
      cadence: "annual",
    },
    { key: "cashGift", label: "Cash Gift", amount: CASH_GIFT, cadence: "annual" },
    { key: "pei", label: "Productivity Enhancement Incentive", amount: PEI_AMOUNT, cadence: "annual" },
  ];

  const totalMonthly = monthly.reduce((s, i) => s + i.amount, 0);
  const totalAnnual = annual.reduce((s, i) => s + i.amount, 0);

  const rRate = retirementRate(yearsOfActiveService);
  const pension: PensionEstimate = {
    retirementRate: rRate,
    retirementMonthly: basePay * rRate,
    disabilityUpfront: basePay * 12,
    disabilityMonthly: basePay * 0.8,
    survivorMonthly: basePay * 0.5,
    retirementEligible: yearsOfActiveService >= 20,
  };

  return {
    basePay,
    lpRate,
    lpAmount,
    subsistenceClass,
    monthly,
    annual,
    totalMonthly,
    totalAnnual,
    pension,
  };
}
