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
  const userId = useSessionStore((s) => s.currentUser.id);
  return useQuery({
    queryKey: ["claims", "list", userId],
    queryFn: () => apiFetch<ClaimRow[]>("/api/claims"),
  });
}

/** Benefits belonging to the current user — options for a new claim request. */
export function useMyBenefitOptions() {
  const userId = useSessionStore((s) => s.currentUser.id);
  return useQuery({
    queryKey: ["claims", "my-benefits", userId],
    queryFn: () => apiFetch<Benefit[]>("/api/personnel/me/benefits"),
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
    },
  });
}
