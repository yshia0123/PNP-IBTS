import { ModuleGuard } from "@/components/layout/module-guard";
import { CompensationPage } from "@/features/compensation/compensation-page";

export default function Page() {
  return (
    <ModuleGuard module="compensation">
      <CompensationPage />
    </ModuleGuard>
  );
}
