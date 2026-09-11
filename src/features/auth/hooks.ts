import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/stores/session-store";
import type { User } from "@/lib/types";

export interface LoginInput {
  email: string;
  password: string;
}

/** Mock login (SSOT Section 1.4). Validates via MSW, stores the user. */
export function useLogin() {
  const setUser = useSessionStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<User>("/api/session/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (user) => setUser(user),
  });
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/** Change the signed-in user's password (mock — validates current password). */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      apiFetch<{ ok: boolean }>("/api/session/change-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}
