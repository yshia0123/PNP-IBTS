"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserCircle2, LogOut } from "lucide-react";
import { useSessionStore } from "@/lib/stores/session-store";
import { GlobalSearch } from "@/features/search/global-search";
import { NotificationBell } from "@/features/notifications/notification-bell";
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
  const currentUser = useSessionStore((s) => s.currentUser);
  const logout = useSessionStore((s) => s.logout);
  const router = useRouter();

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

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />

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
