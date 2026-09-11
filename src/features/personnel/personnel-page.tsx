"use client";

import { Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/lib/stores/session-store";
import { can } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import type { Personnel } from "@/lib/types";
import { usePersonnel } from "./hooks";

/**
 * PersonnelPage (SSOT Section 2.2, Phase 3 step 9).
 * Sortable/filterable/paginated table of personnel. Edit action is gated on
 * the `personnel.write` capability (Section 2.4).
 */
const STATUS_VARIANT = {
  active: "success",
  retired: "info",
  separated: "neutral",
} as const;

export function PersonnelPage() {
  const { data, isLoading, isError, refetch } = usePersonnel();
  const role = useSessionStore((s) => s.currentUser?.role ?? "dependent");
  const canWrite = can(role, "personnel.write");

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
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (p) => (
        <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Personnel Records
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canWrite
            ? "Full access — view and manage personnel records."
            : "Read-only view of personnel records."}
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        getRowId={(p) => p.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        filterPlaceholder="Filter by name, rank, status..."
        emptyMessage="No personnel records match your filter."
        rowActions={
          canWrite
            ? () => (
                <button
                  type="button"
                  aria-label="Edit record"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                </button>
              )
            : undefined
        }
      />
    </div>
  );
}
