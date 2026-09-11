"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToastStore, type Toast } from "@/lib/stores/toast-store";
import { cn } from "@/lib/utils";

const VARIANT_META = {
  success: { icon: CheckCircle2, cls: "text-success" },
  error: { icon: AlertCircle, cls: "text-danger" },
  info: { icon: Info, cls: "text-primary" },
} as const;

const AUTO_DISMISS_MS = 4000;

function ToastCard({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismissToast);
  const meta = VARIANT_META[toast.variant];
  const Icon = meta.icon;

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-80 items-start gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg"
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", meta.cls)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

/**
 * Toaster (SSOT Section 2.2). Mounted once in the shell; renders active toasts
 * from the toast store in a fixed, aria-live region.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  );
}
