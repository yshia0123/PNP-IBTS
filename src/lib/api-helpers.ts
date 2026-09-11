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

/** Local YYYY-MM-DD (avoids UTC day-rollback; matches the earlier fix). */
export function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
