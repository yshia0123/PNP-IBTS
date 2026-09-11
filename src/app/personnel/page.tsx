import { ModuleGuard } from "@/components/layout/module-guard";
import { PersonnelPage } from "@/features/personnel/personnel-page";

export default function Page() {
  return (
    <ModuleGuard module="personnel">
      <PersonnelPage />
    </ModuleGuard>
  );
}
