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

interface Credential {
  email: string;
  password: string;
}

interface Db {
  users: User[];
  personnel: Personnel[];
  benefits: Benefit[];
  claims: Claim[];
  dependents: Dependent[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  credentials: Credential[];
}

/** Bump when the seed shape changes to invalidate an old cached snapshot. */
const STORAGE_KEY = "ibts-mock-db";
const STORAGE_VERSION = "1";

function seed(): Db {
  // Deep clone so mutating the db never mutates the imported JSON modules.
  return structuredClone({
    users: usersJson as User[],
    personnel: personnelJson as Personnel[],
    benefits: benefitsJson as Benefit[],
    claims: claimsJson as Claim[],
    dependents: dependentsJson as Dependent[],
    auditLogs: auditLogsJson as AuditLog[],
    notifications: notificationsJson as Notification[],
    credentials: credentialsJson as Credential[],
  });
}

function load(): Db {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${STORAGE_VERSION}`);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    // fall through to seed
  }
  return seed();
}

/**
 * Mock database, seeded from the JSON fixtures and persisted to localStorage
 * so changes (new claims, notifications, accounts) survive page reloads and
 * logout/login within a browser. Use `resetDb()` to restore the seed.
 */
export const db: Db = load();

/** Persist the current db to localStorage (called after every mutation). */
export function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${STORAGE_KEY}:${STORAGE_VERSION}`,
      JSON.stringify(db)
    );
  } catch {
    // storage full / unavailable — ignore for the prototype
  }
}

/** Restore the seed data and clear the persisted snapshot. */
export function resetDb(): void {
  const fresh = seed();
  (Object.keys(fresh) as (keyof Db)[]).forEach((key) => {
    // Replace array contents in place so existing references stay valid.
    (db[key] as unknown[]).length = 0;
    (db[key] as unknown[]).push(...(fresh[key] as unknown[]));
  });
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(`${STORAGE_KEY}:${STORAGE_VERSION}`);
  }
}

/**
 * Today's date as a local `YYYY-MM-DD` string. Uses local date parts rather
 * than `toISOString()` (which converts to UTC and can roll back a day for
 * timezones ahead of UTC, e.g. UTC+8 before 8 AM).
 */
export function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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
