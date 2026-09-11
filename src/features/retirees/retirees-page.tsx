"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { formatDate } from "@/lib/format";
import type { Personnel } from "@/lib/types";
import { useRetirees } from "./hooks";

/**
 * RetireesPage (SSOT Section 2.2, Phase 3 step 11).
 * RetireeSearch (debounced) narrows the retiree dataset feeding the table.
 */
export function RetireesPage() {
  const { data, isLoading, isError, refetch } = useRetirees();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    if (!debouncedQuery.trim()) return rows;
    const q = debouncedQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.rank.toLowerCase().includes(q)
    );
  }, [data, debouncedQuery]);

  const columns: Column<Personnel>[] = [
    { key: "fullName", header: "Name", sortable: true },
    { key: "rank", header: "Rank", sortable: true },
    {
      key: "serviceYears",
      header: "Service Years",
      sortable: true,
      accessor: (p) => p.serviceYears,
      cell: (p) => `${p.serviceYears} yrs`,
    },
    {
      key: "joinDate",
      header: "Joined",
      sortable: true,
      cell: (p) => formatDate(p.joinDate),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Retirees
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search retired personnel by name or rank.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search retirees..."
          aria-label="Search retirees"
          className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(p) => p.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        filterPlaceholder="Refine within results..."
        emptyMessage={
          debouncedQuery
            ? `No retirees match "${debouncedQuery}".`
            : "No retirees on record."
        }
      />
    </div>
  );
}
