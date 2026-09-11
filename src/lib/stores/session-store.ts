import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

/**
 * Session store (SSOT Section 1.4 — mock auth, not real security).
 *
 * Holds the signed-in user. Login validates credentials via the MSW endpoint;
 * the resulting user is persisted to localStorage so a refresh keeps the
 * session. The current user id is sent on every API request (see api-client)
 * so the mock layer scopes data and the UI gates nav/actions per Section 2.4.
 */
interface SessionState {
  currentUser: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUser: null,
      setUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
    }),
    {
      name: "ibts-session",
    }
  )
);
