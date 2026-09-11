import { ModuleGuard } from "@/components/layout/module-guard";
import { AuditPage } from "@/features/audit/audit-page";

export default function Page() {
  return (
    <ModuleGuard module="audit">
      <AuditPage />
    </ModuleGuard>
  );
}
