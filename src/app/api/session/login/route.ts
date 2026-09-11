import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapUser } from "@/lib/db-mappers";
import { audit, jsonError } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    // Surface DB/connection problems as a 500 instead of a misleading 401.
    console.error("[login] Supabase query error:", error.message);
    return jsonError("Login is temporarily unavailable.", 500);
  }

  if (!user) {
    console.warn(`[login] No user found for email "${email}".`);
    return jsonError("Invalid email or password.", 401);
  }
  if (user.password !== password) {
    console.warn(`[login] Password mismatch for "${email}".`);
    return jsonError("Invalid email or password.", 401);
  }

  await audit(user.id, "session.login", "session", user.id);
  return NextResponse.json(mapUser(user));
}
