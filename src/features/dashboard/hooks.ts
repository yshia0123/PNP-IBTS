import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSessionStore } from "@/lib/stores/session-store";
import {
  dismissNotification,
  fetchMyBenefits,
  fetchMyPersonnel,
  fetchNotifications,
  markNotificationRead,
} from "./api";

/**
 * Query keys for the dashboard feature. Keyed by the active user id so that
 * switching role (a different current user) refetches scoped data.
 */
export const dashboardKeys = {
  personnel: (userId: string) =>
    ["dashboard", "personnel", "me", userId] as const,
  benefits: (userId: string) =>
    ["dashboard", "benefits", "me", userId] as const,
  notifications: (userId: string) =>
    ["dashboard", "notifications", userId] as const,
};

export function useMyPersonnel() {
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useQuery({
    queryKey: dashboardKeys.personnel(userId),
    queryFn: fetchMyPersonnel,
  });
}

export function useMyBenefits() {
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useQuery({
    queryKey: dashboardKeys.benefits(userId),
    queryFn: fetchMyBenefits,
  });
}

export function useNotifications() {
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useQuery({
    queryKey: dashboardKeys.notifications(userId),
    queryFn: fetchNotifications,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.notifications(userId),
      });
    },
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.currentUser?.id ?? "anon");
  return useMutation({
    mutationFn: (id: string) => dismissNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.notifications(userId),
      });
    },
  });
}
