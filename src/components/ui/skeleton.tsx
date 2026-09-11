import { cn } from "@/lib/utils";

/**
 * Skeleton loading placeholder (SSOT Section 2.2 reused component; expanded in
 * Phase 5). Every data-fetching component shows a skeleton while loading to
 * avoid layout shift (SSOT Section 6.1).
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden
      {...props}
    />
  );
}
