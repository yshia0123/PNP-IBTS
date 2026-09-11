"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, X, Inbox } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationRead,
  useDismissNotification,
} from "@/features/dashboard/hooks";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * NotificationBell (SSOT Section 2.2 — NotificationBell with badge + dropdown).
 * Reuses the notification queries/mutations; shows unread count and lets the
 * user mark read / dismiss inline.
 */
export function NotificationBell() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const dismiss = useDismissNotification();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-expanded={open}
        className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-sm font-semibold text-foreground">
              Notifications
            </p>
            {unread > 0 && (
              <span className="text-xs text-muted-foreground">
                {unread} unread
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Loading…
              </p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <Inbox className="h-7 w-7 text-muted-foreground" aria-hidden />
                <p className="mt-2 text-sm font-medium text-foreground">
                  You&apos;re all caught up
                </p>
                <p className="text-xs text-muted-foreground">
                  No notifications right now.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      "flex items-start gap-2 px-4 py-3",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markRead.mutate(n.id)}
                          aria-label={`Mark "${n.title}" as read`}
                          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => dismiss.mutate(n.id)}
                        aria-label={`Dismiss "${n.title}"`}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
