"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, Search, UserCircle2, LogOut } from "lucide-react";
import { useUiStore } from "@/lib/stores/ui-store";
import { useSessionStore } from "@/lib/stores/session-store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  hr_manager: "HR Manager",
  officer: "Officer",
  retiree: "Retiree",
  dependent: "Dependent",
};

/**
 * Header (SmartContainer) — SSOT Section 2.1/2.2.
 * Shows the signed-in user and a logout action (mock auth, Section 1.4).
 */
export function Header() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const currentUser = useSessionStore((s) => s.currentUser);
  const logout = useSessionStore((s) => s.logout);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-surface px-4">
      <div className="flex items-center gap-2">
        <Image
          src="/pnp-logo.png"
          alt="PNP logo"
          width={28}
          height={28}
          priority
          className="h-7 w-7 shrink-0 object-contain"
        />
        <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
          PNP IBTS
        </span>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search personnel, claims, benefits..."
          aria-label="Global search"
          className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-5 w-5" aria-hidden />
          <span
            className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-danger"
            aria-hidden
          />
        </button>

        <div className="flex items-center gap-2 rounded-md p-1.5 text-foreground">
          <UserCircle2 className="h-7 w-7 text-muted-foreground" aria-hidden />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight">
              {currentUser?.name}
            </p>
            <p className="text-xs leading-tight text-muted-foreground">
              {currentUser?.rank ? `${currentUser.rank} · ` : ""}
              {currentUser ? ROLE_LABEL[currentUser.role] : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
