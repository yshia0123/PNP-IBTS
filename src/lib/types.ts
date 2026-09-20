/**
 * Core domain types for IBTS.
 * Mirrors PROJECT_SOURCE_OF_TRUTH.md Section 4.1 exactly so the mock JSON,
 * MSW handlers, and (later) a Prisma schema all share one shape.
 */
import type { CompensationProfileInputs } from "@/lib/compensation";

export type Role = "admin" | "hr_manager" | "officer" | "retiree" | "dependent";
export type BenefitStatus = "active" | "pending" | "suspended" | "expired";
export type ClaimStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export interface User {
  id: string;
  name: string;
  role: Role;
  rank?: string; // e.g. "PCOL"
  division?: string; // e.g. "Benefits Admin Div, DPRM"
  avatarUrl?: string;
  email: string;
}

export interface PromotionRecord {
  id: string;
  fromRank: string;
  toRank: string;
  date: string;
}

export interface Personnel {
  id: string;
  userId: string;
  fullName: string;
  rank: string;
  /**
   * Whole years of service, COMPUTED from joinDate → (separationDate or today).
   * Not a raw stored value — always derived in mapPersonnel so every module
   * shows a consistent, real-time figure.
   */
  serviceYears: number;
  joinDate: string; // ISO date — date of entry
  /** Last day of service (retired/separated). Undefined while active. */
  separationDate?: string;
  promotionHistory: PromotionRecord[];
  status: "active" | "retired" | "separated";
  /**
   * Admin-entered situational compensation inputs (Salary & Compensation
   * module). Computed bonuses/allowances/pensions are derived on read from
   * these inputs plus the person's rank and service years — not stored.
   * Optional so existing consumers that don't touch payroll are unaffected.
   */
  compensation?: CompensationProfileInputs;
}

export interface Benefit {
  id: string;
  personnelId: string;
  type: "active_benefit" | "retirement" | "insurance";
  label: string;
  status: BenefitStatus;
  amount?: number;
  effectiveDate: string;
  expiryDate?: string;
}

export interface Claim {
  id: string;
  personnelId: string;
  benefitId: string;
  status: ClaimStatus;
  submittedDate: string;
  reviewedBy?: string;
  reviewedAt?: string; // ISO timestamp when review started
  notes?: string;
}

export interface Dependent {
  id: string;
  personnelId: string;
  fullName: string;
  relationship: "spouse" | "child" | "parent" | "other";
  verificationStatus: "verified" | "pending" | "unverified";
  requestedDate?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "alert" | "info" | "action_required";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/**
 * Rank-based salary reference (Salary & Compensation module).
 * Effective Jan 1, 2027 per Executive No. 107 (2nd Tranche). NUP
 * (Non-Uniformed Personnel) is included and treated identically to uniformed
 * ranks for pay computation (same Longevity Pay tiers, same CAL formula).
 */
export interface RankPayGrade {
  rank: string; // e.g. "NUP", "PGEN", "PLT"
  salaryGrade: number;
  basePay: number;
}
