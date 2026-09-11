import usersJson from "../../mock-data/users.json";
import personnelJson from "../../mock-data/personnel.json";
import benefitsJson from "../../mock-data/benefits.json";
import claimsJson from "../../mock-data/claims.json";
import dependentsJson from "../../mock-data/dependents.json";
import auditLogsJson from "../../mock-data/audit_logs.json";
import notificationsJson from "../../mock-data/notifications.json";
import credentialsJson from "../../mock-data/credentials.json";

import type {
  AuditLog,
  Benefit,
  Claim,
  Dependent,
  Notification,
  Personnel,
  User,
} from "@/lib/types";

/**
 * In-memory mock database, seeded from the JSON fixtures in /mock-data.
 * MSW handlers read and mutate these arrays so the prototype behaves like a
 * real backend within a session (SSOT Section 3.3). Reloading the page resets
 * state, matching the "local, resettable data" goal (Section 1.3).
 */
interface Credential {
  email: string;
  password: string;
}

export const db = {
  users: usersJson as User[],
  personnel: personnelJson as Personnel[],
  benefits: benefitsJson as Benefit[],
  claims: claimsJson as Claim[],
  dependents: dependentsJson as Dependent[],
  auditLogs: auditLogsJson as AuditLog[],
  notifications: notificationsJson as Notification[],
  // Mock credentials — prototype auth only, never real security (Section 1.4).
  credentials: credentialsJson as Credential[],
};

/** Simulate realistic network latency (SSOT Section 3.3: 300–800ms). */
export function latency(): Promise<void> {
  const ms = 300 + Math.floor(Math.random() * 500);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Occasionally fail (~5% rate) so the UI is forced to handle real-world error
 * conditions (SSOT Section 3.3). Handlers call this and short-circuit with a
 * 500 when it returns true.
 */
export function shouldFail(rate = 0.05): boolean {
  return Math.random() < rate;
}
