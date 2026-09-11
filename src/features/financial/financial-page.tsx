"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSessionStore } from "@/lib/stores/session-store";
import { formatCurrency } from "@/lib/format";
import { toast } from "@/lib/stores/toast-store";
import { useFinancialSummary, type FinancialSummary } from "./hooks";

const STATUS_COLORS: Record<string, string> = {
  active: "var(--success-500)",
  pending: "var(--warning-500)",
  suspended: "var(--danger-500)",
  expired: "#94a3b8",
  submitted: "var(--blue-500)",
  under_review: "var(--warning-500)",
  approved: "var(--success-500)",
  rejected: "var(--danger-500)",
  draft: "#94a3b8",
};

export function FinancialPage() {
  const { data, isLoading, isError, refetch } = useFinancialSummary();
  const role = useSessionStore((s) => s.currentUser?.role ?? "dependent");
  const canExport = role === "admin"; // HR is read-only (Section 2.4)

  const handleExport = () => {
    if (!data) return;
    const csv = buildCsv(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ibts-financial-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported", "CSV downloaded.");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Financial Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canExport
              ? "Benefit commitments and claim activity across the organization."
              : "Read-only view of benefit commitments and claim activity."}
          </p>
        </div>
        {canExport && (
          <button
            type="button"
            onClick={handleExport}
            disabled={!data}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </button>
        )}
      </div>

      {isError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-danger">
              Couldn&apos;t load financial data.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              label="Total Committed"
              value={data ? formatCurrency(data.totalCommitted) : undefined}
              loading={isLoading}
            />
            <Kpi
              label="Active Commitments"
              value={data ? formatCurrency(data.activeCommitted) : undefined}
              loading={isLoading}
            />
            <Kpi
              label="Benefits"
              value={data ? String(data.benefitCount) : undefined}
              loading={isLoading}
            />
            <Kpi
              label="Claims"
              value={data ? String(data.claimCount) : undefined}
              loading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Spend by benefit type */}
            <Card>
              <CardHeader>
                <CardTitle>Committed Amount by Benefit Type</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : !data || data.spendByType.length === 0 ? (
                  <EmptyState message="No benefit data yet." />
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.spendByType}
                        margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          tickLine={false}
                          axisLine={{ stroke: "var(--border)" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          tickLine={false}
                          axisLine={false}
                          width={70}
                          tickFormatter={(v: number) =>
                            `₱${(v / 1000).toLocaleString()}k`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "var(--foreground)",
                          }}
                          formatter={(v: number) => [formatCurrency(v), "Total"]}
                        />
                        <Bar
                          dataKey="total"
                          fill="var(--blue-500)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Claim status distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Claims by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : !data || data.claimStatus.length === 0 ? (
                  <EmptyState message="No claim data yet." />
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.claimStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) =>
                            `${(entry.status as string).replace("_", " ")} (${entry.count})`
                          }
                          labelLine={false}
                          fontSize={11}
                        >
                          {data.claimStatus.map((entry) => (
                            <Cell
                              key={entry.status}
                              fill={STATUS_COLORS[entry.status] ?? "#94a3b8"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                            color: "var(--foreground)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  loading,
}: {
  label: string;
  value?: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading || value === undefined ? (
          <Skeleton className="mt-2 h-7 w-24" />
        ) : (
          <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

/** Build a small CSV summary for the mock export. */
function buildCsv(data: FinancialSummary): string {
  const lines: string[] = [];
  lines.push("IBTS Financial Report");
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push("");
  lines.push("Metric,Value");
  lines.push(`Total Committed,${data.totalCommitted}`);
  lines.push(`Active Commitments,${data.activeCommitted}`);
  lines.push(`Benefit Count,${data.benefitCount}`);
  lines.push(`Claim Count,${data.claimCount}`);
  lines.push("");
  lines.push("Benefit Type,Committed Amount");
  for (const row of data.spendByType) {
    lines.push(`${row.label},${row.total}`);
  }
  lines.push("");
  lines.push("Claim Status,Count");
  for (const row of data.claimStatus) {
    lines.push(`${row.status},${row.count}`);
  }
  return lines.join("\n");
}
