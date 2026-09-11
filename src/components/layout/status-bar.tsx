"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Health = "checking" | "ok" | "error";

/**
 * StatusBar (SmartContainer) — SSOT Section 2.1.
 * Health indicator + last data-sync timestamp. It calls the MSW-backed
 * `/api/health` endpoint on mount, which doubles as an end-to-end proof that
 * request interception is working (SSOT Section 3.3 / Phase 1 step 4).
 */
export function StatusBar() {
  const [health, setHealth] = useState<Health>("checking");
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { timestamp: string };
        if (!active) return;
        setHealth("ok");
        setLastSync(data.timestamp);
      } catch {
        if (active) setHealth("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const label =
    health === "ok"
      ? "Operational"
      : health === "error"
        ? "Degraded"
        : "Checking…";

  return (
    <footer
      className="flex h-8 items-center justify-between border-t border-border bg-surface px-4 text-xs text-muted-foreground"
      aria-label="System status"
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            health === "ok" && "bg-success",
            health === "error" && "bg-danger",
            health === "checking" && "bg-warning"
          )}
          aria-hidden
        />
        <span>System: {label}</span>
      </div>
      <div>
        Last sync:{" "}
        {lastSync ? new Date(lastSync).toLocaleString() : "—"}
      </div>
    </footer>
  );
}
