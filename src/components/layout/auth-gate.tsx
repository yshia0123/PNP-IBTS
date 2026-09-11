"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/stores/session-store";
import { AppShell } from "@/components/layout/app-shell";
import { LoginPage } from "@/features/auth/login-page";

/**
 * AuthGate — mock auth boundary (SSOT Section 1.4).
 *
 * Unauthenticated users see the login page (no shell). Authenticated users see
 * the app shell with the requested page. Because the session is persisted to
 * localStorage, we wait for hydration before deciding to avoid a flash.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const currentUser = useSessionStore((s) => s.currentUser);
  const pathname = usePathname();
  const router = useRouter();

  // Zustand persist rehydrates from localStorage after mount. On the server
  // `persist` state isn't available, so default to not-hydrated and subscribe
  // to the hydration lifecycle on the client.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useSessionStore.persist.hasHydrated()) {
      // One-time flag: the store already rehydrated before this mounted.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true);
      return;
    }
    const unsub = useSessionStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (currentUser && pathname === "/login") {
      router.replace("/");
    }
  }, [hydrated, currentUser, pathname, router]);

  if (!hydrated) return null;

  // The /login route renders bare (no shell) regardless of auth state.
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return <AppShell>{children}</AppShell>;
}
