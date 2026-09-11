import { AlertTriangle, Bell, Info, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

/**
 * AlertItem (SSOT Section 2.2, Phase 2 step 8).
 * Presentational row for a single notification with mark-read / dismiss
 * action callbacks. Icon-only buttons carry aria-labels (Section 2.3).
 */
const TYPE_META = {
  action_required: {
    icon: AlertTriangle,
    variant: "danger" as const,
    label: "Action Required",
  },
  alert: { icon: Bell, variant: "warning" as const, label: "Alert" },
  info: { icon: Info, variant: "info" as const, label: "Info" },
};

interface AlertItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  isBusy?: boolean;
}

export function AlertItem({
  notification,
  onMarkRead,
  onDismiss,
  isBusy,
}: AlertItemProps) {
  const meta = TYPE_META[notification.type];
  const Icon = meta.icon;

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-md border border-border p-3",
        notification.read ? "bg-surface opacity-70" : "bg-surface"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          meta.variant === "danger" && "bg-danger/10 text-danger",
          meta.variant === "warning" && "bg-warning/10 text-warning",
          meta.variant === "info" && "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {notification.title}
          </p>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(notification.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!notification.read && (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            disabled={isBusy}
            aria-label={`Mark "${notification.title}" as read`}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(notification.id)}
          disabled={isBusy}
          aria-label={`Dismiss "${notification.title}"`}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}
