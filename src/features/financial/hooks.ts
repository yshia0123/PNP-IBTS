import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface FinancialSummary {
  totalCommitted: number;
  activeCommitted: number;
  benefitCount: number;
  claimCount: number;
  spendByType: { type: string; label: string; total: number }[];
  benefitStatus: { status: string; count: number }[];
  claimStatus: { status: string; count: number }[];
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: ["financial", "summary"],
    queryFn: () => apiFetch<FinancialSummary>("/api/financial/summary"),
  });
}
