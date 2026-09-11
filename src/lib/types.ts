/**
 * Core domain types for IBTS.
 * Mirrors PROJECT_SOURCE_OF_TRUTH.md Section 4.1 exactly so the mock JSON,
 * MSW handlers, and (later) a Prisma schema all share one shape.
 */

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
  serviceYears: number;
  joinDate: string; // ISO date
  promotionHistory: PromotionRecord[];
  status: "active" | "retired" | "separated";
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
