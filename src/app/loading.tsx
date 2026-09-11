import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading fallback (SSOT Phase 5 step 15). Shown during navigation
 * before a segment's content is ready, avoiding a blank flash.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
  );
}
