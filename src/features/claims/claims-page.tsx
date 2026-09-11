"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/lib/stores/session-store";
import { can } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import type { ClaimStatus } from "@/lib/types";
import { Plus } from "lucide-react";
import {
  useClaims,
  useDecideClaim,
  useStartReview,
  type ClaimRow,
} from "./hooks";
import { ClaimWorkflowModal } from "./claim-workflow-modal";
import { ClaimRequestModal } from "./claim-request-modal";

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
  const startReview = useStartReview();
  const decide = useDecideClaim();
  const role = useSessionStore((s) => s.currentUser.role);
  const canDecide = can(role, "claims.decide");
  const canSubmit = can(role, "claims.submit");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  // Derive the active claim from live query data so the modal reflects status
  // changes (e.g. after "Start Review") once the list refetches.
  const active = data?.find((c) => c.id === activeId) ?? null;

  const openClaim = (claim: ClaimRow) => {
    setActiveId(claim.id);
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {canDecide ? "Claims Management" : "My Claims"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canDecide
              ? "Review all submitted claims and record approve/reject decisions."
              : "Request a new claim and track the status of your requests."}
          </p>
        </div>
        {canSubmit && (
          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden /> New Claim Request
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        getRowId={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        filterPlaceholder="Filter by claimant, benefit, status..."
        emptyMessage={
          canDecide
            ? "No claims match your filter."
            : "You haven't submitted any claims yet."
        }
        rowActions={(claim) => {
          const decidable =
            claim.status === "submitted" || claim.status === "under_review";
          return (
            <button
              type="button"
              onClick={() => openClaim(claim)}
              className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              {canDecide && decidable ? "Review" : "View"}
            </button>
          );
        }}
      />

      <ClaimWorkflowModal
        claim={active}
        open={open}
        onClose={() => {
          setOpen(false);
          setActiveId(null);
        }}
        startReview={startReview}
        decide={decide}
        canDecide={canDecide}
      />

      <ClaimRequestModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
      />
    </div>
  );
}
