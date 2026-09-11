"use client";

import { AlertTriangle } from "lucide-react";

/**
 * ErrorFallback (SSOT Section 2.2 — ErrorBoundary, Phase 5 step 17).
 * Friendly fallback UI rendered by route-segment error boundaries.
 */
export function ErrorFallback({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this section.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-surface p-8 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-danger" aria-hidden />
      <h1 className="mt-3 text-lg font-semibold text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  );
}
