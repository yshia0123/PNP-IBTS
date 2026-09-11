"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { ClaimRow, useDecideClaim } from "./hooks";
import type { ClaimStatus } from "@/lib/types";

/**
 * ClaimWorkflowModal (SSOT Section 2.2, Phase 3 step 10).
 * Multi-step workflow: Review → Decision → Done. Local step state now; the
 * form is upgraded to React Hook Form + Zod in Phase 4.
 */
type Step = "review" | "decision" | "done";

interface Props {
  claim: ClaimRow | null;
  open: boolean;
  onClose: () => void;
  decide: ReturnType<typeof useDecideClaim>;
  canDecide: boolean;
}

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

export function ClaimWorkflowModal({
  claim,
  open,
  onClose,
  decide,
  canDecide,
}: Props) {
  const [step, setStep] = useState<Step>("review");
  const [notes, setNotes] = useState("");

  if (!claim) return null;

  const handleClose = () => {
    setStep("review");
    setNotes("");
    onClose();
  };

  const submitDecision = (status: ClaimStatus) => {
    decide.mutate(
      { id: claim.id, status, notes },
      { onSuccess: () => setStep("done") }
    );
  };

  return (
    <Modal open={open} onClose={handleClose} title={`Claim ${claim.id}`}>
      {/* Step indicator */}
      <ol className="mb-4 flex items-center gap-2 text-xs">
        {(["review", "decision", "done"] as Step[]).map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium " +
                (step === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground")
              }
            >
              {i + 1}
            </span>
            <span className="capitalize text-muted-foreground">{s}</span>
            {i < 2 && <span className="text-muted-foreground">→</span>}
          </li>
        ))}
      </ol>

      {step === "review" && (
        <div className="space-y-3">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Claimant</dt>
              <dd className="font-medium text-foreground">
                {claim.claimantName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Benefit</dt>
              <dd className="font-medium text-foreground">
                {claim.benefitLabel}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Submitted</dt>
              <dd className="font-medium text-foreground">
                {formatDate(claim.submittedDate)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Current status</dt>
              <dd>
                <Badge variant={STATUS_VARIANT[claim.status]}>
                  {claim.status.replace("_", " ")}
                </Badge>
              </dd>
            </div>
            {claim.notes && (
              <div>
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="mt-1 text-foreground">{claim.notes}</dd>
              </div>
            )}
          </dl>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Close
            </button>
            {canDecide && (
              <button
                type="button"
                onClick={() => setStep("decision")}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Proceed to decision
              </button>
            )}
          </div>
        </div>
      )}

      {step === "decision" && (
        <div className="space-y-3">
          <label
            htmlFor="decision-notes"
            className="block text-sm font-medium text-foreground"
          >
            Decision notes (optional)
          </label>
          <textarea
            id="decision-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background p-2 text-sm text-foreground focus:outline-none"
            placeholder="Add a note for the audit trail..."
          />
          <div className="flex justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep("review")}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Back
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={decide.isPending}
                onClick={() => submitDecision("rejected")}
                className="inline-flex items-center gap-1 rounded-md bg-danger px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden /> Reject
              </button>
              <button
                type="button"
                disabled={decide.isPending}
                onClick={() => submitDecision("approved")}
                className="inline-flex items-center gap-1 rounded-md bg-success px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                <Check className="h-4 w-4" aria-hidden /> Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm font-medium text-foreground">
            Decision recorded
          </p>
          <p className="text-sm text-muted-foreground">
            Claim {claim.id} has been updated and an audit entry was logged.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}
