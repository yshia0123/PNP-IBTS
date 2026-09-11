import { ModuleGuard } from "@/components/layout/module-guard";
import { FinancialPage } from "@/features/financial/financial-page";

export default function Page() {
  return (
    <ModuleGuard module="financial">
      <FinancialPage />
    </ModuleGuard>
  );
}
