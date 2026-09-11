"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/lib/stores/session-store";
import type { Role } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  hr_manager: "HR Manager",
  officer: "Officer",
  retiree: "Retiree",
  dependent: "Dependent",
};

/**
 * AccountDetails (SSOT Section 2.2). Read-only summary of the signed-in
 * account — role, account ID, rank, and email.
 */
export function AccountDetails() {
  const currentUser = useSessionStore((s) => s.currentUser);
  if (!currentUser) return null;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Account ID", value: currentUser.id },
    {
      label: "Role",
      value: <Badge variant="info">{ROLE_LABEL[currentUser.role]}</Badge>,
    },
    { label: "Rank", value: currentUser.rank ?? "—" },
    { label: "Email", value: currentUser.email },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Account details are managed by an administrator.
        </p>
      </CardContent>
    </Card>
  );
}
