import { Settings as SettingsIcon } from "lucide-react";
import { ModuleGuard } from "@/components/layout/module-guard";
import { Card, CardContent } from "@/components/ui/card";

/**
 * SettingsPage (SSOT Section 2.2). Profile/preferences/theme form lands in
 * Phase 4; guarded placeholder for now. Every role has Settings access.
 */
export default function Page() {
  return (
    <ModuleGuard module="settings">
      <div className="mx-auto max-w-6xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Profile, preferences, and theme.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <SettingsIcon
              className="h-10 w-10 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-3 text-sm font-medium text-foreground">
              Settings form coming soon
            </p>
            <p className="text-xs text-muted-foreground">
              Profile and preferences (React Hook Form + Zod) arrive in Phase 4.
            </p>
          </CardContent>
        </Card>
      </div>
    </ModuleGuard>
  );
}
