"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useUiStore } from "@/lib/stores/ui-store";
import { useSessionStore } from "@/lib/stores/session-store";
import { canAccessModule } from "@/lib/permissions";
import { NAV_ITEMS, APP_VERSION } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Sidebar (SmartContainer) — SSOT Section 2.1/2.2.
 * Collapse state lives in the Zustand UI store. Collapses to an icon-only
 * rail; the toggle is a real <button> so it is keyboard-accessible.
 */
export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const role = useSessionStore((s) => s.currentUser?.role ?? "dependent");

  const visibleItems = NAV_ITEMS.filter((item) =>
    canAccessModule(role, item.key)
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <Image
          src="/pnp-logo.png"
          alt="PNP logo"
          width={32}
          height={32}
          priority
          className="h-8 w-8 shrink-0 rounded-full bg-white/10 object-contain"
        />
        {!collapsed && (
          <span className="truncate text-lg font-semibold tracking-tight">
            PNP IBTS
          </span>
        )}
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-1 px-2">
        {visibleItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-active/70",
                active
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-foreground/80",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-active/70",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5 shrink-0" aria-hidden />
          ) : (
            <PanelLeftClose className="h-5 w-5 shrink-0" aria-hidden />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
        {!collapsed && (
          <p className="px-3 pt-2 text-xs text-sidebar-foreground/50">
            v{APP_VERSION}
          </p>
        )}
      </div>
    </aside>
  );
}
