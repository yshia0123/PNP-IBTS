"use client";

import { useMemo, useState } from "react";
import { Search, User } from "lucide-react";
import type { Personnel } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * PersonSearch — pick the officer / retiree / dependent-sponsor to work on.
 * Filters the personnel list client-side by name or rank and reports the
 * selected id up. Presentational: it receives the list and selection.
 */
export function PersonSearch({
  people,
  selectedId,
  onSelect,
  loading,
}: {
  people: Personnel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.rank.toLowerCase().includes(q)
    );
  }, [people, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or rank…"
          aria-label="Search personnel"
          className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)]"
        />
      </div>

      <ul
        className="max-h-72 space-y-1 overflow-y-auto"
        aria-label="Personnel results"
      >
        {loading ? (
          <li className="px-3 py-2 text-sm text-muted-foreground">Loading…</li>
        ) : filtered.length === 0 ? (
          <li className="px-3 py-2 text-sm text-muted-foreground">
            No personnel match “{query}”.
          </li>
        ) : (
          filtered.map((p) => {
            const active = p.id === selectedId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "border-[var(--blue-500)] bg-[var(--blue-500)]/10"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {p.fullName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.rank} · {p.serviceYears} yrs ·{" "}
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
