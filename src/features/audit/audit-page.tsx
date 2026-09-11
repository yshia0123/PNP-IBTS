"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/ui/data-table";
import { apiFetch } from "@/lib/api-client";
import type { AuditLog } from "@/lib/types";

/**
 * AuditLogsPage (SSOT Section 2.2, Phase 3). Read-only, timestamped table.
 * Admin and HR manager can read (Section 2.4).
 */
function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => apiFetch<AuditLog[]>("/api/audit-logs"),
  });
}

export function AuditPage() {
  const { data, isLoading, isError, refetch } = useAuditLogs();

  const columns: Column<AuditLog>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      sortable: true,
      cell: (l) => new Date(l.timestamp).toLocaleString(),
    },
    { key: "actorId", header: "Actor", sortable: true },
    { key: "action", header: "Action", sortable: true },
    { key: "targetType", header: "Target Type", sortable: true },
    { key: "targetId", header: "Target", sortable: true },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Audit Log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only, timestamped record of system actions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        getRowId={(l) => l.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        filterPlaceholder="Filter by actor, action, target..."
        emptyMessage="No audit entries yet."
      />
    </div>
  );
}
