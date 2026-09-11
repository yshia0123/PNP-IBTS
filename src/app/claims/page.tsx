import { ModuleGuard } from "@/components/layout/module-guard";
import { ClaimsPage } from "@/features/claims/claims-page";

export default function Page() {
  return (
    <ModuleGuard module="claims">
      <ClaimsPage />
    </ModuleGuard>
  );
}
