import { apiFetch } from "@/lib/api-client";
import type { Benefit, Notification, Personnel } from "@/lib/types";

/** Personnel record for the dashboard, including resolved division. */
export type DashboardPersonnel = Personnel & { division?: string };

export function fetchMyPersonnel() {
  return apiFetch<DashboardPersonnel | null>("/api/personnel/me");
}

export function fetchMyBenefits() {
  return apiFetch<Benefit[]>("/api/personnel/me/benefits");
}

export function fetchNotifications() {
  return apiFetch<Notification[]>("/api/notifications");
}

export function markNotificationRead(id: string, read = true) {
  return apiFetch<Notification>(`/api/notifications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ read }),
  });
}

export function dismissNotification(id: string) {
  return apiFetch<void>(`/api/notifications/${id}`, { method: "DELETE" });
}
