"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/lib/stores/session-store";
import { can } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import type { ClaimStatus } from "@/lib/types";
import { useClaims, useDecideClaim, type ClaimRow } from "./hooks";
import { ClaimWorkflowModal } from "./claim-workflow-modal";

/**
 * ClaimsPage (SSOT Section 2.2, Phase 3 step 10).
 * Claims table + multi-step ClaimWorkflowModal. The decide capability
 * (approve/reject) is gated per role (Section 2.4): admin & HR manager can
 * decide; officers/retirees can only view.
 */
const STATUS_VARIANT: Record<
  ClaimStatus,
  "success" | "warning" | "danger" | "info" | "neutral"
> = {
  draft: "neutral",
  submitted: "info",
  under_review: "warning",
  approved: "success",
  rejected: "danger",
};

export function ClaimsPage() {
  const { data, isLoading, isError, refetch } = useClaims();
  const decide = useDecideClaim();
  const role = useSessionStore((s) => s.currentUser.role);
  const canDecide = can(role, "claims.decide");

  const [active, setActive] = useState<ClaimRow | null>(null);
  const [open, setOpen] = useState(false);

  const openClaim = (claim: ClaimRow) => {
    setActive(claim);
    setOpen(true);
  };

  const columns: Column<ClaimRow>[] = [
    { key: "id", header: "Claim ID", sortable: true },
    { key: "claimantName", header: "Claimant", sortable: true },
    { key: "benefitLabel", header: "Benefit", sortable: true },
    {
      key: "submittedDate",
      header: "Submitted",
      sortable: true,
      cell: (c) => formatDate(c.submittedDate),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (c) => (
        <Badge variant={STATUS_VARIANT[c.status]}>
          {c.status.replace("_", " ")}
        </Badge>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Claims Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canDecide
            ? "Review claims and record approve/reject decisions."
            : "View the status of submitted claims."}
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        getRowId={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        filterPlaceholder="Filter by claimant, benefit, status..."
        emptyMessage="No claims match your filter."
        rowActions={(claim) => (
          <button
            type="button"
            onClick={() => openClaim(claim)}
            className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            {canDecide ? "Review" : "View"}
          </button>
        )}
      />

      <ClaimWorkflowModal
        claim={active}
        open={open}
        onClose={() => setOpen(false)}
        decide={decide}
        canDecide={canDecide}
      />
    </div>
  );
}
