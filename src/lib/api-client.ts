import { useSessionStore } from "@/lib/stores/session-store";

/**
 * Thin fetch wrapper used by all feature API modules. Throws on non-2xx so
 * TanStack Query surfaces error states, and parses JSON responses.
 *
 * Attaches the current demo user id as `x-demo-user-id` so the MSW layer can
 * scope responses to the active role (SSOT Section 1.4 / 2.4).
 */
export async function apiFetch<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const currentUserId = useSessionStore.getState().currentUser?.id;

  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(currentUserId ? { "x-demo-user-id": currentUserId } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // non-JSON error body; keep the default message
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
