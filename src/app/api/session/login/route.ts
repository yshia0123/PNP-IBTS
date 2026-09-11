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

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (!user || user.password !== password) {
    return jsonError("Invalid email or password.", 401);
  }

  await audit(user.id, "session.login", "session", user.id);
  return NextResponse.json(mapUser(user));
}
