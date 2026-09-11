"use client";

import { useState } from "react";
import { Pencil, UserPlus } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/lib/stores/session-store";
import { can } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import type { Personnel } from "@/lib/types";
import { usePersonnel } from "./hooks";
import { EditPersonnelModal } from "./edit-personnel-modal";
import { AddAccountModal } from "./add-account-modal";

/**
 * PersonnelPage (SSOT Section 2.2, Phase 3/4).
 * Sortable/filterable/paginated table of personnel. Admin & HR can add new
 * accounts and edit records (gated on the `personnel.write` capability).
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

  const [editing, setEditing] = useState<Personnel | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const openEdit = (record: Personnel) => {
    setEditing(record);
    setEditOpen(true);
  };

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Personnel Records
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canWrite
              ? "Full access — add accounts and manage personnel records."
              : "Read-only view of personnel records."}
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" aria-hidden /> Add Account
          </button>
        )}
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
            ? (record) => (
                <button
                  type="button"
                  onClick={() => openEdit(record)}
                  aria-label={`Edit ${record.fullName}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                </button>
              )
            : undefined
        }
      />

      <EditPersonnelModal
        personnel={editing}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <AddAccountModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        personnel={data ?? []}
      />
    </div>
  );
}
