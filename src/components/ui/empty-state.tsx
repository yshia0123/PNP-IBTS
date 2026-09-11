import { Inbox } from "lucide-react";

/**
 * EmptyState (SSOT Section 2.2 reused component; expanded in Phase 5).
 * Shown for zero-result tables and feeds (Section 6.1).
 */
export function EmptyState({
  message = "No results found.",
  hint,
}: {
  message?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground">{message}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
