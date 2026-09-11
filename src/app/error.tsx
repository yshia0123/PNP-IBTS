"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/components/ui/error-fallback";

/**
 * Route-segment error boundary (SSOT Phase 5 step 17). Catches render/data
 * errors in the app segment and offers a recovery action.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app this would report to an error tracker.
    console.error(error);
  }, [error]);

  return (
    <div className="p-6">
      <ErrorFallback onRetry={reset} />
    </div>
  );
}
