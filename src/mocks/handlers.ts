import { http, HttpResponse } from "msw";
import { db, latency, shouldFail } from "./db";

/**
 * MSW request handlers (SSOT Section 3.3).
 *
 * All handlers add 300–800ms latency and a ~5% error rate so the UI must
 * handle loading and error states. Data is read from / mutated on the
 * in-memory `db` seeded from /mock-data.
 *
 * Demo assumption: the signed-in user is the HR manager `u-001` (Alex V.
 * Cruz) whose personnel record is `p-001`. Role switching / real auth arrives
 * in Phase 4.
 */
const CURRENT_USER_ID = "u-001";
const CURRENT_PERSONNEL_ID = "p-001";

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      service: "IBTS mock API",
      interception: "active",
      timestamp: new Date().toISOString(),
    });
  }),

  // Personnel record for the dashboard hero + performance portfolio.
  http.get("/api/personnel/me", async () => {
    await latency();
    if (shouldFail()) {
      return HttpResponse.json(
        { message: "Failed to load personnel record." },
        { status: 500 }
      );
    }
    const record = db.personnel.find((p) => p.id === CURRENT_PERSONNEL_ID);
    if (!record) {
      return HttpResponse.json(
        { message: "Personnel record not found." },
        { status: 404 }
      );
    }
    const user = db.users.find((u) => u.id === record.userId);
    return HttpResponse.json({ ...record, division: user?.division });
  }),

  // Benefits for the current personnel (BenefitsSummaryGrid).
  http.get("/api/personnel/me/benefits", async () => {
    await latency();
    if (shouldFail()) {
      return HttpResponse.json(
        { message: "Failed to load benefits." },
        { status: 500 }
      );
    }
    const benefits = db.benefits.filter(
      (b) => b.personnelId === CURRENT_PERSONNEL_ID
    );
    return HttpResponse.json(benefits);
  }),

  // Notifications for the current user (ActionRequiredFeed).
  http.get("/api/notifications", async () => {
    await latency();
    if (shouldFail()) {
      return HttpResponse.json(
        { message: "Failed to load notifications." },
        { status: 500 }
      );
    }
    const notifications = db.notifications
      .filter((n) => n.userId === CURRENT_USER_ID)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json(notifications);
  }),

  // Mark a single notification as read.
  http.patch("/api/notifications/:id", async ({ params, request }) => {
    await latency();
    const { id } = params as { id: string };
    const body = (await request.json().catch(() => ({}))) as {
      read?: boolean;
    };
    const notification = db.notifications.find((n) => n.id === id);
    if (!notification) {
      return HttpResponse.json(
        { message: "Notification not found." },
        { status: 404 }
      );
    }
    notification.read = body.read ?? true;
    return HttpResponse.json(notification);
  }),

  // Dismiss (delete) a notification.
  http.delete("/api/notifications/:id", async ({ params }) => {
    await latency();
    const { id } = params as { id: string };
    const index = db.notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      return HttpResponse.json(
        { message: "Notification not found." },
        { status: 404 }
      );
    }
    db.notifications.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
