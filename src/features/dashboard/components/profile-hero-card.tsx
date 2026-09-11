import { CalendarDays, Building2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import type { DashboardPersonnel } from "../api";

/**
 * ProfileHeroCard (SSOT Section 2.1/2.2, Phase 2 step 5).
 * Presentational: renders the personnel hero. Data + states are passed in.
 */
interface ProfileHeroCardProps {
  personnel?: DashboardPersonnel;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

const statusVariant = {
  active: "success",
  retired: "info",
  separated: "neutral",
} as const;

export function ProfileHeroCard({
  personnel,
  isLoading,
  isError,
  onRetry,
}: ProfileHeroCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </Card>
    );
  }

  if (isError || !personnel) {
    return (
      <Card className="p-6">
        <p className="text-sm text-danger">
          Couldn&apos;t load the profile.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Retry
          </button>
        )}
      </Card>
    );
  }

  const initials = personnel.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <Card className="overflow-hidden">
      <div className="bg-sidebar px-6 py-5 text-sidebar-foreground">
        <div className="flex items-center gap-5">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="truncate text-xl font-semibold" title={personnel.fullName}>
                {personnel.fullName}
              </h2>
              <Badge variant={statusVariant[personnel.status]}>
                {personnel.status}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-sidebar-foreground/80">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              <span className="font-medium">{personnel.rank}</span>
            </div>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Service Years
          </dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">
            {personnel.serviceYears} yrs
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" aria-hidden /> Division / Unit
          </dt>
          <dd
            className="mt-1 truncate text-sm font-medium text-foreground"
            title={personnel.division ?? "—"}
          >
            {personnel.division ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Joined
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {formatDate(personnel.joinDate)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
