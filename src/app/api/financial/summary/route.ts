import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const TYPE_LABELS: Record<string, string> = {
  active_benefit: "Active Benefits",
  retirement: "Retirement",
  insurance: "Insurance",
};

// Aggregated financial summary for the reports page.
export async function GET() {
  const [{ data: benefits }, { data: claims }] = await Promise.all([
    supabaseAdmin.from("benefits").select("type, status, amount"),
    supabaseAdmin.from("claims").select("status"),
  ]);

  const b = benefits ?? [];
  const c = claims ?? [];

  const byTypeMap = new Map<string, number>();
  for (const row of b) {
    byTypeMap.set(row.type, (byTypeMap.get(row.type) ?? 0) + (row.amount ?? 0));
  }
  const spendByType = Array.from(byTypeMap.entries()).map(([type, total]) => ({
    type,
    label: TYPE_LABELS[type] ?? type,
    total,
  }));

  const statusMap = new Map<string, number>();
  for (const row of b) {
    statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1);
  }
  const benefitStatus = Array.from(statusMap.entries()).map(
    ([status, count]) => ({ status, count })
  );

  const claimMap = new Map<string, number>();
  for (const row of c) {
    claimMap.set(row.status, (claimMap.get(row.status) ?? 0) + 1);
  }
  const claimStatus = Array.from(claimMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  const totalCommitted = b.reduce((sum, x) => sum + (x.amount ?? 0), 0);
  const activeCommitted = b
    .filter((x) => x.status === "active")
    .reduce((sum, x) => sum + (x.amount ?? 0), 0);

  return NextResponse.json({
    totalCommitted,
    activeCommitted,
    benefitCount: b.length,
    claimCount: c.length,
    spendByType,
    benefitStatus,
    claimStatus,
  });
}
