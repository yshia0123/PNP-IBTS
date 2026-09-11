import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapUser } from "@/lib/db-mappers";
import type { User } from "@/lib/types";

/** The current demo user id sent by the client (api-client.ts). */
export function currentUserId(request: Request): string | null {
  return request.headers.get("x-demo-user-id");
}

/** Resolve the current user from the demo header, or null. */
export async function currentUser(request: Request): Promise<User | null> {
  const id = currentUserId(request);
  if (!id) return null;
  const { data } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapUser(data) : null;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/** Insert an audit-log row (best effort; ignores failures). */
export async function audit(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string
): Promise<void> {
  await supabaseAdmin.from("audit_logs").insert({
    id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Today's date as YYYY-MM-DD in Philippine time (Asia/Manila).
 *
 * These routes run on serverless functions (Vercel) whose local time is UTC,
 * so `new Date()` parts would roll the date back a day for PH mornings. Format
 * against a fixed timezone so the submitted/join/request dates are always the
 * correct calendar day for the users.
 */
const APP_TIME_ZONE = "Asia/Manila";

export function todayLocal(): string {
  // en-CA gives an ISO-style YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
