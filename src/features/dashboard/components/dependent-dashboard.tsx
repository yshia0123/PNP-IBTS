"use client";

import {
  BadgeCheck,
  Clock,
  ShieldQuestion,
  ShieldCheck,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "@/lib/stores/toast-store";
import {
  useMyDependentInfo,
  useRequestReverification,
} from "../dependent-hooks";
import type { Dependent } from "@/lib/types";

/**
 * DependentDashboard (SSOT Section 2.4 — Dependent: verification-focused).
 *
 * A dependent isn't personnel, so their dashboard centers on: verification
 * status, what documents are still needed, their sponsor, and the beneficiary
 * benefits they're entitled to. They can request re-verification (resubmit).
 */
const STATUS_META: Record<
  Dependent["verificationStatus"],
  { label: string; variant: "success" | "warning" | "danger"; icon: typeof Clock }
> = {
  verified: { label: "Verified", variant: "success", icon: BadgeCheck },
  pending: { label: "Pending Review", variant: "warning", icon: Clock },
  unverified: { label: "Unverified", variant: "danger", icon: ShieldQuestion },
};

// Documents a dependent needs on file, by relationship (mock guidance).
const REQUIRED_DOCS: Record<Dependent["relationship"], string[]> = {
  spouse: ["Marriage certificate", "Valid government ID", "Recent photo"],
  child: ["Birth certificate", "School / dependency proof", "Valid ID"],
  parent: ["Birth certificate of officer", "Proof of dependency", "Valid ID"],
  other: ["Proof of relationship", "Valid government ID"],
};

export function DependentDashboard() {
  const { data, isLoading, isError, refetch } = useMyDependentInfo();
  const reverify = useRequestReverification();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-danger">
            Couldn&apos;t load your verification status.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  const { dependent, sponsorName, sponsorRank, beneficiaryBenefits } = data;
  const status = STATUS_META[dependent.verificationStatus];
  const StatusIcon = status.icon;
  const docs = REQUIRED_DOCS[dependent.relationship];
  const needsAction = dependent.verificationStatus !== "verified";

  const handleReverify = () => {
    reverify.mutate(undefined, {
      onSuccess: () =>
        toast.success(
          "Verification requested",
          "Your documents were resubmitted for review."
        ),
      onError: (err) =>
        toast.error("Couldn't submit request", (err as Error).message),
    });
  };

  return (
    <div className="space-y-6">
      {/* Verification status hero */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className={
                  "flex h-14 w-14 items-center justify-center rounded-full " +
                  (status.variant === "success"
                    ? "bg-success/10 text-success"
                    : status.variant === "warning"
                      ? "bg-warning/10 text-warning"
                      : "bg-danger/10 text-danger")
                }
              >
                <StatusIcon className="h-7 w-7" aria-hidden />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {dependent.fullName}
                  </h2>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dependent.relationship.charAt(0).toUpperCase() +
                    dependent.relationship.slice(1)}{" "}
                  of {sponsorRank ? `${sponsorRank} ` : ""}
                  {sponsorName ?? "—"}
                </p>
                {dependent.requestedDate && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Last request: {formatDate(dependent.requestedDate)}
                  </p>
                )}
              </div>
            </div>

            {needsAction && (
              <button
                type="button"
                onClick={handleReverify}
                disabled={reverify.isPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                {reverify.isPending ? "Submitting…" : "Request Re-verification"}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Documents needed */}
        <Card>
          <CardHeader>
            <CardTitle>Documents on File</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li key={doc} className="flex items-center gap-2 text-sm">
                  <FileText
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="text-foreground">{doc}</span>
                  {dependent.verificationStatus === "verified" ? (
                    <Badge variant="success" className="ml-auto">
                      On file
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="ml-auto">
                      Needs review
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Beneficiary status */}
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary Status</CardTitle>
          </CardHeader>
          <CardContent>
            {beneficiaryBenefits.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No insurance or death benefits are linked to your sponsor yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {beneficiaryBenefits.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <ShieldCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {b.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Coverage {formatCurrency(b.amount)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={b.status === "active" ? "success" : "warning"}
                    >
                      {b.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Beneficiary payouts require a verified dependent status. Keep your
              documents current to avoid delays.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
