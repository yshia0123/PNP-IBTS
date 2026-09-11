import { http, HttpResponse } from "msw";
import { db, latency, shouldFail } from "./db";
import type { ClaimStatus } from "@/lib/types";

/**
 * MSW request handlers (SSOT Section 3.3).
 *
 * All data handlers add 300–800ms latency and a ~5% error rate so the UI must
 * handle loading and error states. Data is read from / mutated on the
 * in-memory `db` seeded from /mock-data.
 *
 * The active demo user is passed via the `x-demo-user-id` header (set by
 * apiFetch). Handlers use it to scope "me" responses to the current role
 * (SSOT Section 1.4 / 2.4).
 */
function currentUserId(request: Request): string {
  return request.headers.get("x-demo-user-id") ?? "u-002";
}

function personnelForUser(userId: string) {
  return db.personnel.find((p) => p.userId === userId);
}

const maybeFail = (message: string) =>
  HttpResponse.json({ message }, { status: 500 });

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      service: "IBTS mock API",
      interception: "active",
      timestamp: new Date().toISOString(),
    });
  }),

  // ---- Current user ----------------------------------------------------
  http.get("/api/session/me", async ({ request }) => {
    await latency();
    const user = db.users.find((u) => u.id === currentUserId(request));
    if (!user) {
      return HttpResponse.json({ message: "User not found." }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  // ---- Dashboard (scoped to current user) ------------------------------
  http.get("/api/personnel/me", async ({ request }) => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load personnel record.");

    const userId = currentUserId(request);
    const record = personnelForUser(userId);
    if (!record) {
      // Some roles (e.g. dependent) have no personnel record. This is a valid
      // state, not an error — return null so the UI shows a friendly message.
      return HttpResponse.json(null);
    }
    const user = db.users.find((u) => u.id === record.userId);
    return HttpResponse.json({ ...record, division: user?.division });
  }),

  http.get("/api/personnel/me/benefits", async ({ request }) => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load benefits.");

    const record = personnelForUser(currentUserId(request));
    const benefits = record
      ? db.benefits.filter((b) => b.personnelId === record.id)
      : [];
    return HttpResponse.json(benefits);
  }),

  http.get("/api/notifications", async ({ request }) => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load notifications.");

    const userId = currentUserId(request);
    const notifications = db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json(notifications);
  }),

  http.patch("/api/notifications/:id", async ({ params, request }) => {
    await latency();
    const { id } = params as { id: string };
    const body = (await request.json().catch(() => ({}))) as { read?: boolean };
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

  // ---- Personnel module (Phase 3) --------------------------------------
  http.get("/api/personnel", async () => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load personnel.");
    return HttpResponse.json(db.personnel);
  }),

  // ---- Claims module (Phase 3) -----------------------------------------
  http.get("/api/claims", async () => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load claims.");

    // Enrich each claim with the claimant name and benefit label for display.
    const enriched = db.claims.map((claim) => {
      const person = db.personnel.find((p) => p.id === claim.personnelId);
      const benefit = db.benefits.find((b) => b.id === claim.benefitId);
      return {
        ...claim,
        claimantName: person?.fullName ?? claim.personnelId,
        benefitLabel: benefit?.label ?? claim.benefitId,
      };
    });
    return HttpResponse.json(enriched);
  }),

  // Decision on a claim (approve / reject / move to review).
  http.patch("/api/claims/:id", async ({ params, request }) => {
    await latency();
    const { id } = params as { id: string };
    const body = (await request.json().catch(() => ({}))) as {
      status?: ClaimStatus;
      notes?: string;
      reviewedBy?: string;
    };
    const claim = db.claims.find((c) => c.id === id);
    if (!claim) {
      return HttpResponse.json(
        { message: "Claim not found." },
        { status: 404 }
      );
    }
    if (body.status) claim.status = body.status;
    if (body.notes !== undefined) claim.notes = body.notes;
    claim.reviewedBy = body.reviewedBy ?? currentUserId(request);

    // Record an audit entry for the decision (SSOT Section 2.2 AuditLog).
    db.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actorId: currentUserId(request),
      action: `claim.${body.status ?? "updated"}`,
      targetType: "claim",
      targetId: claim.id,
      timestamp: new Date().toISOString(),
    });

    return HttpResponse.json(claim);
  }),

  // ---- Retirees module (Phase 3) ---------------------------------------
  http.get("/api/retirees", async () => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load retirees.");
    const retirees = db.personnel.filter((p) => p.status === "retired");
    return HttpResponse.json(retirees);
  }),

  // ---- Audit logs (read-only) ------------------------------------------
  http.get("/api/audit-logs", async () => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load audit logs.");
    const logs = [...db.auditLogs].sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
    return HttpResponse.json(logs);
  }),
];
