import { ModuleGuard } from "@/components/layout/module-guard";
import { ProfileForm } from "@/features/settings/profile-form";
import { ChangePasswordForm } from "@/features/settings/change-password-form";
import { AccountDetails } from "@/features/settings/account-details";

/**
 * SettingsPage (SSOT Section 2.2). Profile, password, and account details.
 * Every role has Settings access.
 */
export default function Page() {
  return (
    <ModuleGuard module="settings">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and account.
          </p>
        </div>
        <ProfileForm />
        <ChangePasswordForm />
        <AccountDetails />
      </div>
    </ModuleGuard>
  );
}
