import { ModuleGuard } from "@/components/layout/module-guard";
import { RetireesPage } from "@/features/retirees/retirees-page";

export default function Page() {
  return (
    <ModuleGuard module="retirees">
      <RetireesPage />
    </ModuleGuard>
  );
}
