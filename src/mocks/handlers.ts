import { http, HttpResponse } from "msw";

/**
 * MSW request handlers.
 *
 * Phase 1: intentionally minimal. A single health-check endpoint proves that
 * request interception works end-to-end. Feature modules (dashboard, claims,
 * personnel, etc.) will register their own handlers here in later phases,
 * per PROJECT_SOURCE_OF_TRUTH.md Section 3.3.
 */
export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      service: "IBTS mock API",
      interception: "active",
      timestamp: new Date().toISOString(),
    });
  }),
];
