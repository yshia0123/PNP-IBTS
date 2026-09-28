import type {
  AuditLog,
  Benefit,
  Claim,
  Notification,
  Personnel,
  PromotionRecord,
  User,
} from "@/lib/types";
import { computeServiceYears } from "@/lib/format";

/**
 * Row → app-type mappers. Supabase columns are snake_case; the frontend types
 * are camelCase (SSOT Section 4.1). Mapping here keeps API responses identical
 * to what the components already consume, so no frontend changes are needed.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    rank: row.rank ?? undefined,
    division: row.division ?? undefined,
    email: row.email,
  };
}

export function mapPersonnel(row: any): Personnel {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    rank: row.rank,
    // Always computed from the join date so every module gets a consistent,
    // real-time figure. The stored service_years column is a cached mirror.
    serviceYears: computeServiceYears(row.join_date),
    joinDate: row.join_date,
    payslipAccountNo: row.payslip_account_no ?? undefined,
    status: "active",
    promotionHistory: (row.promotion_history ?? []) as PromotionRecord[],
    compensation: (row.compensation ?? {}) as Personnel["compensation"],
  };
}

export function mapBenefit(row: any): Benefit {
  return {
    id: row.id,
    personnelId: row.personnel_id,
    type: row.type,
    label: row.label,
    status: row.status,
    amount: row.amount ?? undefined,
    effectiveDate: row.effective_date,
    expiryDate: row.expiry_date ?? undefined,
  };
}

export function mapClaim(row: any): Claim {
  return {
    id: row.id,
    personnelId: row.personnel_id,
    benefitId: row.benefit_id,
    status: row.status,
    submittedDate: row.submitted_date,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
  };
}

export function mapAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    actorId: row.actor_id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    timestamp: row.timestamp,
  };
}
