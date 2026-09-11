import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/stores/session-store";
import type { Benefit, Claim, ClaimStatus } from "@/lib/types";

/** Claim enriched with display fields from the mock API. */
export interface ClaimRow extends Claim {
  claimantName: string;
  benefitLabel: string;
}

export function useClaims() {
  // Keyed by user so switching role refetches the scoped list.
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useQuery({
    queryKey: ["claims", "list", userId],
    queryFn: () => apiFetch<ClaimRow[]>("/api/claims"),
  });
}

/** Benefits belonging to the current user — options for a new claim request. */
export function useMyBenefitOptions() {
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useQuery({
    queryKey: ["claims", "my-benefits", userId],
    queryFn: () => apiFetch<Benefit[]>("/api/personnel/me/benefits"),
  });
}

/** Apply a partial update to a claim across every cached claims list. */
function patchClaimInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  patch: Partial<ClaimRow>
) {
  queryClient.setQueriesData<ClaimRow[]>(
    { queryKey: ["claims", "list"] },
    (old) =>
      old?.map((c) => (c.id === id ? { ...c, ...patch } : c)) ?? old
  );
}

export function useStartReview() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<ClaimRow>(`/api/claims/${id}/start-review`, {
        method: "PATCH",
      }),
    // Optimistic: flip to under_review immediately (SSOT Phase 4 step 13).
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["claims", "list"] });
      const previous = queryClient.getQueriesData<ClaimRow[]>({
        queryKey: ["claims", "list"],
      });
      patchClaimInCache(queryClient, id, {
        status: "under_review",
        reviewedBy: userId,
        reviewedAt: new Date().toISOString(),
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      context?.previous?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["claims", "list"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export interface ClaimDecision {
  id: string;
  status: ClaimStatus;
  notes?: string;
}

export function useDecideClaim() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useMutation({
    mutationFn: ({ id, status, notes }: ClaimDecision) =>
      apiFetch<Claim>(`/api/claims/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      }),
    // Optimistic: reflect the decision immediately, roll back on error.
    onMutate: async ({ id, status, notes }: ClaimDecision) => {
      await queryClient.cancelQueries({ queryKey: ["claims", "list"] });
      const previous = queryClient.getQueriesData<ClaimRow[]>({
        queryKey: ["claims", "list"],
      });
      patchClaimInCache(queryClient, id, {
        status,
        notes,
        reviewedBy: userId,
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["claims", "list"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export interface NewClaimInput {
  benefitId: string;
  notes?: string;
}

export function useSubmitClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewClaimInput) =>
      apiFetch<ClaimRow>("/api/claims", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims", "list"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      // Refresh the notification bell (the submitter gets a confirmation).
      queryClient.invalidateQueries({ queryKey: ["dashboard", "notifications"] });
    },
  });
}
