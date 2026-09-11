import { ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { PromotionRecord } from "@/lib/types";

/**
 * PromotionHistoryTimeline (SSOT Section 2.2, Phase 2 step 6).
 * Presentational vertical timeline of rank changes.
 */
export function PromotionHistoryTimeline({
  history,
}: {
  history: PromotionRecord[];
}) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No promotion records yet.
      </p>
    );
  }

  const ordered = [...history].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {ordered.map((record) => (
        <li key={record.id} className="relative">
          <span
            className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary"
            aria-hidden
          />
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span>{record.fromRank}</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <span>{record.toRank}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(record.date)}
          </p>
        </li>
      ))}
    </ol>
  );
}
