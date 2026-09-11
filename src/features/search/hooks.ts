import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/stores/session-store";

export interface SearchResult {
  type: "personnel" | "claim" | "retiree";
  id: string;
  label: string;
  sublabel: string;
  href: string;
}

/**
 * Global search (SSOT Phase 4 step 14). Role-scoped on the server; only runs
 * for non-empty queries. Keyed by user so results reflect the current role.
 */
export function useGlobalSearch(query: string) {
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  const q = query.trim();
  return useQuery({
    queryKey: ["search", userId, q],
    queryFn: () =>
      apiFetch<SearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
    staleTime: 10_000,
  });
}
