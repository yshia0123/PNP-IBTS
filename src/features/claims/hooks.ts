import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Claim, ClaimStatus } from "@/lib/types";

/** Claim enriched with display fields from the mock API. */
export interface ClaimRow extends Claim {
  claimantName: string;
  benefitLabel: string;
}

export function useClaims() {
  return useQuery({
    queryKey: ["claims", "list"],
    queryFn: () => apiFetch<ClaimRow[]>("/api/claims"),
  });
}

export interface ClaimDecision {
  id: string;
  status: ClaimStatus;
  notes?: string;
}

export function useDecideClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: ClaimDecision) =>
      apiFetch<Claim>(`/api/claims/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims", "list"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}
