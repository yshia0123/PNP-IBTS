"use client";

import { useState } from "react";
import { Check, X, PlayCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "@/lib/stores/toast-store";
import { cn } from "@/lib/utils";
import type { ClaimRow, useDecideClaim, useStartReview } from "./hooks";
import type { ClaimStatus } from "@/lib/types";

/**
 * ClaimWorkflowModal (SSOT Section 2.2, Phase 3/4).
 *
 * The modal adapts to the claim's current status:
 *  - submitted:     Step 1 inactive; primary action "Start Review" (submitted
 *                   -> under_review, stamps reviewedAt, toast, refresh).
 *  - under_review:  Step 1 active; shows "Review Started"; primary action
 *                   "Proceed to Decision" -> Step 2 (approve / reject).
 *  - decided:       read-only; no primary action.
 */
type Step = "review" | "decision" | "done";

interface Props {
  claim: ClaimRow | null;
  open: boolean;
  onClose: () => void;
  startReview: ReturnType<typeof useStartReview>;
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
  startReview,
  decide,
  canDecide,
}: Props) {
  const [step, setStep] = useState<Step>("review");
  const [notes, setNotes] = useState("");

  if (!claim) return null;

  const isSubmitted = claim.status === "submitted";
  const isUnderReview = claim.status === "under_review";
  const isDecided = claim.status === "approved" || claim.status === "rejected";

  // Step 1 is "active" once review has started (under_review) or we've moved on.
  const step1Active = step !== "review" || isUnderReview || isDecided;
  const step2Active = step === "decision" || step === "done";

  const handleClose = () => {
    setStep("review");
    setNotes("");
    onClose();
  };

  const handleStartReview = () => {
    startReview.mutate(claim.id, {
      onSuccess: () => {
        toast.success(
          "Claim status updated to Under Review",
          `${claim.id} is now assigned to you for review.`
        );
        // Stay on the review step; the refreshed claim (now under_review) will
        // render the active Step 1 and the "Proceed to Decision" action.
      },
      onError: (err) =>
        toast.error("Couldn't start review", (err as Error).message),
    });
  };

  const submitDecision = (status: ClaimStatus) => {
    decide.mutate(
      { id: claim.id, status, notes },
      {
        onSuccess: () => {
          setStep("done");
          toast.success(
            status === "approved" ? "Claim approved" : "Claim rejected",
            `${claim.id} decision recorded.`
          );
        },
        onError: (err) =>
          toast.error("Couldn't record decision", (err as Error).message),
      }
    );
  };

  const steps: { key: Step; label: string; active: boolean }[] = [
    { key: "review", label: "Review", active: step1Active },
    { key: "decision", label: "Decision", active: step2Active },
    { key: "done", label: "Done", active: step === "done" },
  ];

  return (
    <Modal open={open} onClose={handleClose} title={`Claim ${claim.id}`}>
      {/* Step indicator */}
      <ol className="mb-4 flex items-center gap-2 text-xs">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                s.active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "capitalize",
                s.active ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-muted-foreground">→</span>
            )}
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
            {/* Review metadata appears once review has started. */}
            {(isUnderReview || isDecided) && claim.reviewedAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Review Started</dt>
                <dd className="font-medium text-foreground">
                  {formatDateTime(claim.reviewedAt)}
                </dd>
              </div>
            )}
            {(isUnderReview || isDecided) && claim.reviewedBy && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Assigned Reviewer</dt>
                <dd className="font-medium text-foreground">
                  {claim.reviewedBy}
                </dd>
              </div>
            )}
            {claim.notes && (
              <div>
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="mt-1 text-foreground">{claim.notes}</dd>
              </div>
            )}
          </dl>

          {canDecide && isDecided && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              This claim is {claim.status.replace("_", " ")} — a final decision
              has already been recorded, so no further action is available.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Close
            </button>

            {canDecide && isSubmitted && (
              <button
                type="button"
                disabled={startReview.isPending}
                onClick={handleStartReview}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <PlayCircle className="h-4 w-4" aria-hidden />
                {startReview.isPending ? "Starting…" : "Start Review"}
              </button>
            )}

            {canDecide && isUnderReview && (
              <button
                type="button"
                onClick={() => setStep("decision")}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Proceed to Decision
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
