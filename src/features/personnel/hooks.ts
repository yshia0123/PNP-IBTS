import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Personnel } from "@/lib/types";

export function usePersonnel() {
  return useQuery({
    queryKey: ["personnel", "list"],
    queryFn: () => apiFetch<Personnel[]>("/api/personnel"),
  });
}
