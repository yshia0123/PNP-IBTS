import type {
  AuditLog,
  Benefit,
  Claim,
  Dependent,
  Notification,
  Personnel,
  PromotionRecord,
  User,
} from "@/lib/types";

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
    serviceYears: row.service_years,
    joinDate: row.join_date,
    status: row.status,
    promotionHistory: (row.promotion_history ?? []) as PromotionRecord[],
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

export function mapDependent(row: any): Dependent {
  return {
    id: row.id,
    personnelId: row.personnel_id,
    fullName: row.full_name,
    relationship: row.relationship,
    verificationStatus: row.verification_status,
    requestedDate: row.requested_date ?? undefined,
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
