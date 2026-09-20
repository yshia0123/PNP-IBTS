import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Personnel, RankPayGrade } from "@/lib/types";
import type {
  ComputedCompensation,
  CompensationProfileInputs,
} from "@/lib/compensation";

/**
 * Load the rank-based salary reference table (Salary & Compensation module).
 * The API returns rows in seeded order (NUP first); we do NOT sort.
 */
export function useRankPayGrades() {
  return useQuery({
    queryKey: ["compensation", "rank-pay-grades"],
    queryFn: () =>
      apiFetch<RankPayGrade[]>("/api/compensation/rank-pay-grades"),
    staleTime: Infinity, // static reference data
  });
}

/** All personnel — the pool the person search/selector filters over. */
export function usePersonnelList() {
  return useQuery({
    queryKey: ["personnel", "list"],
    queryFn: () => apiFetch<Personnel[]>("/api/personnel"),
  });
}

/** Server contract for a person's compensation (GET + PATCH responses). */
export interface CompensationResponse {
  person: Personnel;
  inputs: CompensationProfileInputs;
  tableBasePay: number;
  salaryGrade: number;
  computed: ComputedCompensation;
}

/** Load one person's saved inputs + tentative computed profile. */
export function usePersonCompensation(personnelId: string | null) {
  return useQuery({
    queryKey: ["compensation", "person", personnelId],
    queryFn: () =>
      apiFetch<CompensationResponse>(
        `/api/personnel/${personnelId}/compensation`
      ),
    enabled: !!personnelId,
  });
}

/**
 * Save (PATCH) a person's compensation inputs. On success we prime the query
 * cache with the server-recomputed profile so the UI reflects the saved state
 * immediately without a refetch round-trip.
 */
export function useSaveCompensation(personnelId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inputs: Partial<CompensationProfileInputs>) =>
      apiFetch<CompensationResponse>(
        `/api/personnel/${personnelId}/compensation`,
        { method: "PATCH", body: JSON.stringify(inputs) }
      ),
    onSuccess: (data) => {
      qc.setQueryData(["compensation", "person", personnelId], data);
      // If the editor is viewing their own dashboard, refresh the "My
      // Compensation" card too (cross-user updates refetch on window focus).
      qc.invalidateQueries({ queryKey: ["dashboard", "compensation", "me"] });
    },
  });
}
