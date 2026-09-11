import { create } from "zustand";
import usersJson from "../../../mock-data/users.json";
import type { Role, User } from "@/lib/types";

/**
 * Demo session (SSOT Section 1.4 — mock role-switcher, not real auth).
 *
 * The prototype ships one representative user per role. Switching role in the
 * header swaps the "current user", which the MSW layer reads (via the
 * `x-demo-user-id` request header) to return that person's data, and which the
 * UI reads to gate navigation and actions per Section 2.4.
 */
const USERS = usersJson as User[];

/** First user found for each role — the representative demo account. */
export const ROLE_TO_USER: Record<Role, User> = (() => {
  const roles: Role[] = [
    "admin",
    "hr_manager",
    "officer",
    "retiree",
    "dependent",
  ];
  const map = {} as Record<Role, User>;
  for (const role of roles) {
    const user = USERS.find((u) => u.role === role);
    if (user) map[role] = user;
  }
  return map;
})();

interface SessionState {
  currentUser: User;
  setRole: (role: Role) => void;
}

// Default demo identity: the admin (full access).
const DEFAULT_USER = ROLE_TO_USER.admin;

export const useSessionStore = create<SessionState>((set) => ({
  currentUser: DEFAULT_USER,
  setRole: (role) => {
    const user = ROLE_TO_USER[role];
    if (user) set({ currentUser: user });
  },
}));
