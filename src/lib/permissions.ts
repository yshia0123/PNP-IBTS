import type { Role } from "@/lib/types";

/**
 * Role-Based View Matrix (SSOT Section 2.4).
 *
 * `nav` = which sidebar modules are visible to a role.
 * `can`  = fine-grained action capabilities used to gate buttons/columns.
 *
 * This is a prototype gate for demo purposes only — not real authorization
 * (SSOT Section 1.4).
 */
export type ModuleKey =
  | "dashboard"
  | "personnel"
  | "claims"
  | "retirees"
  | "financial"
  | "compensation"
  | "audit"
  | "settings";

export type Capability =
  | "personnel.read"
  | "personnel.write"
  | "claims.read"
  | "claims.decide" // approve / reject
  | "claims.submit"
  | "retirees.read"
  | "financial.read"
  | "audit.read"
  | "dependents.verify"
  | "compensation.read"
  | "compensation.override"; // edit allowance overrides (Admin-only)

const MATRIX: Record<Role, { nav: ModuleKey[]; can: Capability[] }> = {
  admin: {
    nav: [
      "dashboard",
      "personnel",
      "claims",
      "retirees",
      "financial",
      "compensation",
      "audit",
      "settings",
    ],
    can: [
      "personnel.read",
      "personnel.write",
      "claims.read",
      "claims.decide",
      "claims.submit",
      "retirees.read",
      "financial.read",
      "audit.read",
      "dependents.verify",
      "compensation.read",
      "compensation.override", // Admin may edit allowance overrides
    ],
  },
  hr_manager: {
    nav: [
      "dashboard",
      "personnel",
      "claims",
      "retirees",
      "financial",
      "compensation",
      "audit",
      "settings",
    ],
    can: [
      "personnel.read",
      "personnel.write",
      "claims.read",
      "claims.decide",
      "retirees.read",
      "financial.read", // read-only (no financial.write capability exists)
      "audit.read", // read-only
      "dependents.verify",
      "compensation.read", // read-only (no compensation.override)
    ],
  },
  officer: {
    nav: ["dashboard", "personnel", "claims", "settings"],
    can: ["personnel.read", "claims.read", "claims.submit"],
  },
  retiree: {
    nav: ["dashboard", "claims", "retirees", "settings"],
    can: ["claims.read", "claims.submit", "retirees.read"],
  },
  dependent: {
    nav: ["dashboard", "settings"],
    can: [],
  },
};

export function navForRole(role: Role): ModuleKey[] {
  return MATRIX[role].nav;
}

export function can(role: Role, capability: Capability): boolean {
  return MATRIX[role].can.includes(capability);
}

/** Whether a role may see a given module at all. */
export function canAccessModule(role: Role, module: ModuleKey): boolean {
  return MATRIX[role].nav.includes(module);
}
