import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Personnel } from "@/lib/types";

export function usePersonnel() {
  return useQuery({
    queryKey: ["personnel", "list"],
    queryFn: () => apiFetch<Personnel[]>("/api/personnel"),
  });
}

export interface NewAccountInput {
  fullName: string;
  email: string;
  role: "officer" | "retiree" | "dependent";
  rank?: string;
  serviceYears?: number;
  joinDate?: string;
  relationship?: "spouse" | "child" | "parent" | "other";
  sponsorPersonnelId?: string;
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewAccountInput) =>
      apiFetch("/api/personnel", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personnel", "list"] });
      queryClient.invalidateQueries({ queryKey: ["retirees", "list"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export interface EditPersonnelInput {
  id: string;
  fullName: string;
  rank: string;
  serviceYears: number;
  joinDate: string;
  status: "active" | "retired" | "separated";
}

export function useUpdatePersonnel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: EditPersonnelInput) =>
      apiFetch<Personnel>(`/api/personnel/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personnel", "list"] });
      queryClient.invalidateQueries({ queryKey: ["retirees", "list"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}
