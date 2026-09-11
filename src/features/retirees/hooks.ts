import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Personnel } from "@/lib/types";

export function useRetirees() {
  return useQuery({
    queryKey: ["retirees", "list"],
    queryFn: () => apiFetch<Personnel[]>("/api/retirees"),
  });
}
