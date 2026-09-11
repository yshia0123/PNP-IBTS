"use client";

import { useEffect } from "react";
import { Bell, Search, UserCircle2 } from "lucide-react";
import { useUiStore } from "@/lib/stores/ui-store";
import { useSessionStore } from "@/lib/stores/session-store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "officer", label: "Officer" },
  { value: "retiree", label: "Retiree" },
  { value: "dependent", label: "Dependent" },
];

/**
 * Header (SmartContainer) — SSOT Section 2.1/2.2.
 * The demo role switcher swaps the current user (one representative account
 * per role), which drives data scoping and nav/action gating (Section 2.4).
 */
export function Header() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const currentUser = useSessionStore((s) => s.currentUser);
  const setRole = useSessionStore((s) => s.setRole);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-surface px-4">
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
        {/* Demo-only role switcher (SSOT Section 1.4 / 2.4). */}
        <label className="sr-only" htmlFor="role-switcher">
          Switch role
        </label>
        <select
          id="role-switcher"
          value={currentUser.role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

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
            className={cn(
              "absolute right-1 top-1 flex h-2 w-2 rounded-full bg-danger"
            )}
            aria-hidden
          />
        </button>

        <div className="flex items-center gap-2 rounded-md p-1.5 text-foreground">
          <UserCircle2 className="h-7 w-7 text-muted-foreground" aria-hidden />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight">
              {currentUser.name}
            </p>
            <p className="text-xs leading-tight text-muted-foreground">
              {currentUser.rank ? `${currentUser.rank} · ` : ""}
              {ROLES.find((r) => r.value === currentUser.role)?.label}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
