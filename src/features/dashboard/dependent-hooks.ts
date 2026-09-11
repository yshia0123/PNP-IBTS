import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/stores/session-store";
import type { Benefit, Dependent } from "@/lib/types";

export interface DependentInfo {
  dependent: Dependent;
  sponsorName: string | null;
  sponsorRank: string | null;
  beneficiaryBenefits: Benefit[];
}

export function useMyDependentInfo() {
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useQuery({
    queryKey: ["dependent", "me", userId],
    queryFn: () => apiFetch<DependentInfo>("/api/dependents/me"),
  });
}

export function useRequestReverification() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useMutation({
    mutationFn: () =>
      apiFetch<Dependent>("/api/dependents/me/verify", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependent", "me", userId] });
    },
  });
}
