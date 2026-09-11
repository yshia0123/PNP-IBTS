"use client";

import { Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertItem } from "./alert-item";
import {
  useDismissNotification,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks";

/**
 * ActionRequiredFeed (SSOT Section 2.2, Phase 2 step 8).
 * Smart container: reads notifications and owns mark-read / dismiss actions.
 * Shows loading, error, and empty states.
 */
export function ActionRequiredFeed() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const dismiss = useDismissNotification();

  const busyId = markRead.isPending
    ? markRead.variables
    : dismiss.isPending
      ? dismiss.variables
      : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Required</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ul className="space-y-3">
            {[0, 1, 2].map((i) => (
              <li key={i}>
                <Skeleton className="h-20 w-full" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div>
            <p className="text-sm text-danger">
              Couldn&apos;t load notifications.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="mt-2 text-sm font-medium text-foreground">
              You&apos;re all caught up
            </p>
            <p className="text-xs text-muted-foreground">
              No action items right now.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {data.map((notification) => (
              <AlertItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markRead.mutate(id)}
                onDismiss={(id) => dismiss.mutate(id)}
                isBusy={busyId === notification.id}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
