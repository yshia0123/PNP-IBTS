import { BarChart3 } from "lucide-react";
import { ModuleGuard } from "@/components/layout/module-guard";
import { Card, CardContent } from "@/components/ui/card";

/**
 * FinancialReportsPage (SSOT Section 2.2). Charts + export land in a later
 * phase; this is a guarded placeholder. Admin: full; HR manager: read-only.
 */
export default function Page() {
  return (
    <ModuleGuard module="financial">
      <div className="mx-auto max-w-6xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Financial Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Benefit spend and disbursement reporting.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-medium text-foreground">
              Reports coming soon
            </p>
            <p className="text-xs text-muted-foreground">
              Charts and mock export land in a later phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </ModuleGuard>
  );
}
