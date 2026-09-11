import { ModuleGuard } from "@/components/layout/module-guard";
import { SettingsForm } from "@/features/settings/settings-form";

/**
 * SettingsPage (SSOT Section 2.2). Profile + preferences via RHF + Zod.
 * Every role has Settings access.
 */
export default function Page() {
  return (
    <ModuleGuard module="settings">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and preferences.
          </p>
        </div>
        <SettingsForm />
      </div>
    </ModuleGuard>
  );
}
