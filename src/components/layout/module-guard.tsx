"use client";

import { ShieldAlert } from "lucide-react";
import { useSessionStore } from "@/lib/stores/session-store";
import { canAccessModule, type ModuleKey } from "@/lib/permissions";

/**
 * Gates a module page by role (SSOT Section 2.4). If the current role can't
 * access the module, shows an access-denied state instead of the content.
 * This is a demo gate, not real authorization (Section 1.4).
 */
export function ModuleGuard({
  module,
  children,
}: {
  module: ModuleKey;
  children: React.ReactNode;
}) {
  const role = useSessionStore((s) => s.currentUser.role);

  if (!canAccessModule(role, module)) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-surface p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-warning" aria-hidden />
        <h1 className="mt-3 text-lg font-semibold text-foreground">
          Access restricted
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your role doesn&apos;t have access to this module. Switch roles from
          the header to explore what each role can see.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
