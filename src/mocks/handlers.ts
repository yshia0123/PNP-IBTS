import { http, HttpResponse } from "msw";
import { db, latency, persist, shouldFail } from "./db";
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

  // ---- Auth (mock — prototype only, not real security) -----------------
  http.post("/api/session/login", async ({ request }) => {
    await latency();
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    const cred = db.credentials.find((c) => c.email.toLowerCase() === email);
    if (!cred || cred.password !== password) {
      return HttpResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      return HttpResponse.json(
        { message: "Account not found." },
        { status: 404 }
      );
    }

    db.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actorId: user.id,
      action: "session.login",
      targetType: "session",
      targetId: user.id,
      timestamp: new Date().toISOString(),
    });
    persist();

    return HttpResponse.json(user);
  }),

  // Change password (validates the current password against the credential).
  http.post("/api/session/change-password", async ({ request }) => {
    await latency();
    const userId = currentUserId(request);
    const user = db.users.find((u) => u.id === userId);
    const body = (await request.json().catch(() => ({}))) as {
      currentPassword?: string;
      newPassword?: string;
    };

    const cred = user
      ? db.credentials.find(
          (c) => c.email.toLowerCase() === user.email.toLowerCase()
        )
      : undefined;

    if (!cred) {
      return HttpResponse.json(
        { message: "No credential on file for this account." },
        { status: 404 }
      );
    }
    if (cred.password !== (body.currentPassword ?? "")) {
      return HttpResponse.json(
        { message: "Current password is incorrect." },
        { status: 401 }
      );
    }
    if (!body.newPassword || body.newPassword.length < 6) {
      return HttpResponse.json(
        { message: "New password must be at least 6 characters." },
        { status: 422 }
      );
    }

    cred.password = body.newPassword;
    db.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actorId: userId,
      action: "session.password_changed",
      targetType: "session",
      targetId: userId,
      timestamp: new Date().toISOString(),
    });
    persist();

    return HttpResponse.json({ ok: true });
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
    persist();
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
    persist();
    return new HttpResponse(null, { status: 204 });
  }),

  // ---- Dependent self-service view -------------------------------------
  // Resolves the dependent record for the signed-in dependent user, plus
  // their sponsor and the beneficiary benefits they may be entitled to.
  http.get("/api/dependents/me", async ({ request }) => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load verification status.");

    const user = db.users.find((u) => u.id === currentUserId(request));
    if (!user) {
      return HttpResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Match the dependent record by name (prototype linkage).
    const dependent = db.dependents.find(
      (d) => d.fullName.toLowerCase() === user.name.toLowerCase()
    );
    if (!dependent) {
      return HttpResponse.json(
        { message: "No dependent record linked to this account." },
        { status: 404 }
      );
    }

    const sponsor = db.personnel.find((p) => p.id === dependent.personnelId);
    // Insurance / death benefits are the ones relevant to a beneficiary.
    const beneficiaryBenefits = db.benefits.filter(
      (b) => b.personnelId === dependent.personnelId && b.type === "insurance"
    );

    return HttpResponse.json({
      dependent,
      sponsorName: sponsor?.fullName ?? null,
      sponsorRank: sponsor?.rank ?? null,
      beneficiaryBenefits,
    });
  }),

  // Dependent requests re-verification (resubmits their documents).
  http.post("/api/dependents/me/verify", async ({ request }) => {
    await latency();
    const user = db.users.find((u) => u.id === currentUserId(request));
    const dependent = user
      ? db.dependents.find(
          (d) => d.fullName.toLowerCase() === user.name.toLowerCase()
        )
      : undefined;
    if (!dependent) {
      return HttpResponse.json(
        { message: "No dependent record linked to this account." },
        { status: 404 }
      );
    }

    dependent.verificationStatus = "pending";
    dependent.requestedDate = new Date().toISOString().slice(0, 10);

    db.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actorId: user?.id ?? "unknown",
      action: "dependent.verification_requested",
      targetType: "dependent",
      targetId: dependent.id,
      timestamp: new Date().toISOString(),
    });

    // Notify admins that a dependent verification needs review.
    for (const admin of db.users.filter((u) => u.role === "admin")) {
      db.notifications.unshift({
        id: `n-${Date.now()}-${admin.id}`,
        userId: admin.id,
        type: "action_required",
        title: "Dependent Verification Requested",
        message: `${dependent.fullName} resubmitted documents for verification.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    persist();
    return HttpResponse.json(dependent);
  }),

  // ---- Personnel module (Phase 3) --------------------------------------
  http.get("/api/personnel", async () => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load personnel.");
    return HttpResponse.json(db.personnel);
  }),

  // Admin creates a new account (officer / retiree / dependent). Creates a
  // user and, for personnel-backed roles, a personnel record; for dependents,
  // a dependent record linked to a sponsor.
  http.post("/api/personnel", async ({ request }) => {
    await latency();
    const actorId = currentUserId(request);
    const body = (await request.json().catch(() => ({}))) as {
      fullName?: string;
      email?: string;
      role?: "officer" | "retiree" | "dependent";
      rank?: string;
      serviceYears?: number;
      joinDate?: string;
      relationship?: "spouse" | "child" | "parent" | "other";
      sponsorPersonnelId?: string;
    };

    if (!body.fullName || !body.email || !body.role) {
      return HttpResponse.json(
        { message: "Name, email, and role are required." },
        { status: 422 }
      );
    }
    if (db.users.some((u) => u.email.toLowerCase() === body.email!.toLowerCase())) {
      return HttpResponse.json(
        { message: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const userId = `u-${Date.now()}`;
    db.users.unshift({
      id: userId,
      name: body.fullName,
      role: body.role,
      rank: body.rank,
      email: body.email,
    });

    let createdPersonnel = null;
    if (body.role === "officer" || body.role === "retiree") {
      createdPersonnel = {
        id: `p-${Date.now()}`,
        userId,
        fullName: body.fullName,
        rank: body.rank ?? "N/A",
        serviceYears: body.serviceYears ?? 0,
        joinDate: body.joinDate ?? new Date().toISOString().slice(0, 10),
        status: (body.role === "retiree" ? "retired" : "active") as
          | "active"
          | "retired"
          | "separated",
        promotionHistory: [],
      };
      db.personnel.unshift(createdPersonnel);
    } else if (body.role === "dependent") {
      db.dependents.unshift({
        id: `d-${Date.now()}`,
        personnelId: body.sponsorPersonnelId ?? "",
        fullName: body.fullName,
        relationship: body.relationship ?? "other",
        verificationStatus: "unverified",
        requestedDate: new Date().toISOString().slice(0, 10),
      });
    }

    db.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actorId,
      action: `account.created.${body.role}`,
      targetType: "user",
      targetId: userId,
      timestamp: new Date().toISOString(),
    });

    persist();
    return HttpResponse.json(
      { user: db.users[0], personnel: createdPersonnel },
      { status: 201 }
    );
  }),

  // Admin / HR edits a personnel record.
  http.patch("/api/personnel/:id", async ({ params, request }) => {
    await latency();
    const { id } = params as { id: string };
    const body = (await request.json().catch(() => ({}))) as Partial<{
      fullName: string;
      rank: string;
      serviceYears: number;
      joinDate: string;
      status: "active" | "retired" | "separated";
    }>;
    const record = db.personnel.find((p) => p.id === id);
    if (!record) {
      return HttpResponse.json(
        { message: "Personnel record not found." },
        { status: 404 }
      );
    }
    if (body.fullName !== undefined) record.fullName = body.fullName;
    if (body.rank !== undefined) record.rank = body.rank;
    if (body.serviceYears !== undefined) record.serviceYears = body.serviceYears;
    if (body.joinDate !== undefined) record.joinDate = body.joinDate;
    if (body.status !== undefined) record.status = body.status;

    // Keep the linked user's display name/rank in sync.
    const user = db.users.find((u) => u.id === record.userId);
    if (user) {
      if (body.fullName !== undefined) user.name = body.fullName;
      if (body.rank !== undefined) user.rank = body.rank;
    }

    db.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actorId: currentUserId(request),
      action: "personnel.record.updated",
      targetType: "personnel",
      targetId: record.id,
      timestamp: new Date().toISOString(),
    });
    persist();

    return HttpResponse.json(record);
  }),

  // ---- Claims module (Phase 3) -----------------------------------------
  http.get("/api/claims", async ({ request }) => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load claims.");

    const userId = currentUserId(request);
    const user = db.users.find((u) => u.id === userId);
    // Admin & HR manager see all claims; everyone else sees only their own
    // (SSOT Section 2.4).
    const seesAll = user?.role === "admin" || user?.role === "hr_manager";
    const myPersonnel = personnelForUser(userId);

    const visible = seesAll
      ? db.claims
      : db.claims.filter((c) => c.personnelId === myPersonnel?.id);

    // Enrich each claim with the claimant name and benefit label for display.
    const enriched = visible.map((claim) => {
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

  // Submit a new claim request (officer / retiree). Creates a `submitted`
  // claim tied to the current user's personnel record and notifies admins.
  http.post("/api/claims", async ({ request }) => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to submit claim.");

    const userId = currentUserId(request);
    const person = personnelForUser(userId);
    if (!person) {
      return HttpResponse.json(
        { message: "No personnel record linked to this account." },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      benefitId?: string;
      notes?: string;
    };
    if (!body.benefitId) {
      return HttpResponse.json(
        { message: "A benefit must be selected." },
        { status: 422 }
      );
    }

    const newClaim = {
      id: `c-${Date.now()}`,
      personnelId: person.id,
      benefitId: body.benefitId,
      status: "submitted" as const,
      submittedDate: new Date().toISOString().slice(0, 10),
      notes: body.notes,
    };
    db.claims.unshift(newClaim);

    db.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actorId: userId,
      action: "claim.submitted",
      targetType: "claim",
      targetId: newClaim.id,
      timestamp: new Date().toISOString(),
    });

    // Notify every admin that a new claim needs attention.
    for (const admin of db.users.filter((u) => u.role === "admin")) {
      db.notifications.unshift({
        id: `n-${Date.now()}-${admin.id}`,
        userId: admin.id,
        type: "action_required",
        title: "New Claim Submitted",
        message: `${person.fullName} submitted a new claim (${newClaim.id}).`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    persist();
    const benefit = db.benefits.find((b) => b.id === newClaim.benefitId);
    return HttpResponse.json(
      {
        ...newClaim,
        claimantName: person.fullName,
        benefitLabel: benefit?.label ?? newClaim.benefitId,
      },
      { status: 201 }
    );
  }),

  // Start review: transition submitted -> under_review and stamp reviewedAt.
  http.patch("/api/claims/:id/start-review", async ({ params, request }) => {
    await latency();
    const { id } = params as { id: string };
    const claim = db.claims.find((c) => c.id === id);
    if (!claim) {
      return HttpResponse.json({ message: "Claim not found." }, { status: 404 });
    }
    if (claim.status !== "submitted") {
      return HttpResponse.json(
        { message: `Cannot start review on a ${claim.status} claim.` },
        { status: 409 }
      );
    }

    const actorId = currentUserId(request);
    claim.status = "under_review";
    claim.reviewedBy = actorId;
    claim.reviewedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actorId,
      action: "claim.review_started",
      targetType: "claim",
      targetId: claim.id,
      timestamp: new Date().toISOString(),
    });

    persist();
    const person = db.personnel.find((p) => p.id === claim.personnelId);
    const benefit = db.benefits.find((b) => b.id === claim.benefitId);
    return HttpResponse.json({
      ...claim,
      claimantName: person?.fullName ?? claim.personnelId,
      benefitLabel: benefit?.label ?? claim.benefitId,
    });
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
    persist();

    return HttpResponse.json(claim);
  }),

  // ---- Retirees module (Phase 3) ---------------------------------------
  http.get("/api/retirees", async () => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load retirees.");
    const retirees = db.personnel.filter((p) => p.status === "retired");
    return HttpResponse.json(retirees);
  }),

  // ---- Global search (role-scoped) -------------------------------------
  http.get("/api/search", async ({ request }) => {
    await latency();
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

    const user = db.users.find((u) => u.id === currentUserId(request));
    const role = user?.role ?? "dependent";
    const results: {
      type: "personnel" | "claim" | "retiree";
      id: string;
      label: string;
      sublabel: string;
      href: string;
    }[] = [];

    if (!q) return HttpResponse.json(results);

    const canPersonnel = role === "admin" || role === "hr_manager";
    const canClaims =
      role === "admin" || role === "hr_manager"; // full claim search
    const canRetirees =
      role === "admin" || role === "hr_manager" || role === "retiree";

    if (canPersonnel) {
      for (const p of db.personnel) {
        if (
          p.fullName.toLowerCase().includes(q) ||
          p.rank.toLowerCase().includes(q)
        ) {
          results.push({
            type: "personnel",
            id: p.id,
            label: p.fullName,
            sublabel: `${p.rank} · Personnel`,
            href: "/personnel",
          });
        }
      }
    }

    if (canClaims) {
      for (const c of db.claims) {
        const person = db.personnel.find((p) => p.id === c.personnelId);
        const hay = `${c.id} ${c.status} ${person?.fullName ?? ""}`.toLowerCase();
        if (hay.includes(q)) {
          results.push({
            type: "claim",
            id: c.id,
            label: `Claim ${c.id}`,
            sublabel: `${person?.fullName ?? ""} · ${c.status.replace("_", " ")}`,
            href: "/claims",
          });
        }
      }
    }

    if (canRetirees) {
      for (const p of db.personnel.filter((x) => x.status === "retired")) {
        if (p.fullName.toLowerCase().includes(q) && canRetirees) {
          results.push({
            type: "retiree",
            id: `ret-${p.id}`,
            label: p.fullName,
            sublabel: `${p.rank} · Retiree`,
            href: "/retirees",
          });
        }
      }
    }

    return HttpResponse.json(results.slice(0, 8));
  }),

  // ---- Financial reports (aggregated) ----------------------------------
  http.get("/api/financial/summary", async () => {
    await latency();
    if (shouldFail()) return maybeFail("Failed to load financial summary.");

    const typeLabels: Record<string, string> = {
      active_benefit: "Active Benefits",
      retirement: "Retirement",
      insurance: "Insurance",
    };

    // Total committed amount per benefit type.
    const byTypeMap = new Map<string, number>();
    for (const b of db.benefits) {
      byTypeMap.set(b.type, (byTypeMap.get(b.type) ?? 0) + (b.amount ?? 0));
    }
    const spendByType = Array.from(byTypeMap.entries()).map(([type, total]) => ({
      type,
      label: typeLabels[type] ?? type,
      total,
    }));

    // Benefit status distribution.
    const statusMap = new Map<string, number>();
    for (const b of db.benefits) {
      statusMap.set(b.status, (statusMap.get(b.status) ?? 0) + 1);
    }
    const benefitStatus = Array.from(statusMap.entries()).map(
      ([status, count]) => ({ status, count })
    );

    // Claim status counts.
    const claimMap = new Map<string, number>();
    for (const c of db.claims) {
      claimMap.set(c.status, (claimMap.get(c.status) ?? 0) + 1);
    }
    const claimStatus = Array.from(claimMap.entries()).map(
      ([status, count]) => ({ status, count })
    );

    const totalCommitted = db.benefits.reduce(
      (sum, b) => sum + (b.amount ?? 0),
      0
    );
    const activeCommitted = db.benefits
      .filter((b) => b.status === "active")
      .reduce((sum, b) => sum + (b.amount ?? 0), 0);

    return HttpResponse.json({
      totalCommitted,
      activeCommitted,
      benefitCount: db.benefits.length,
      claimCount: db.claims.length,
      spendByType,
      benefitStatus,
      claimStatus,
    });
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
