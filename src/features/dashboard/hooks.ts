import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  dismissNotification,
  fetchMyBenefits,
  fetchMyPersonnel,
  fetchNotifications,
  markNotificationRead,
} from "./api";

/** Query keys for the dashboard feature. */
export const dashboardKeys = {
  personnel: ["dashboard", "personnel", "me"] as const,
  benefits: ["dashboard", "benefits", "me"] as const,
  notifications: ["dashboard", "notifications"] as const,
};

export function useMyPersonnel() {
  return useQuery({
    queryKey: dashboardKeys.personnel,
    queryFn: fetchMyPersonnel,
  });
}

export function useMyBenefits() {
  return useQuery({
    queryKey: dashboardKeys.benefits,
    queryFn: fetchMyBenefits,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: dashboardKeys.notifications,
    queryFn: fetchNotifications,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.notifications,
      });
    },
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dismissNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.notifications,
      });
    },
  });
}
