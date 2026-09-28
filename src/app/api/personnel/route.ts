import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapPersonnel } from "@/lib/db-mappers";
import { audit, currentUserId, jsonError, todayLocal } from "@/lib/api-helpers";
import { computeServiceYears } from "@/lib/format";

// List all personnel.
export async function GET() {
  const { data } = await supabaseAdmin.from("personnel").select("*");
  return NextResponse.json((data ?? []).map(mapPersonnel));
}

// Admin creates a new officer account.
export async function POST(request: Request) {
  const actorId = currentUserId(request) ?? "unknown";
  const body = (await request.json().catch(() => ({}))) as {
    fullName?: string;
    email?: string;
    rank?: string;
    joinDate?: string;
  };

  if (!body.fullName || !body.email || !body.rank) {
    return jsonError("Name, email, and rank are required.", 422);
  }

  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .ilike("email", body.email.toLowerCase())
    .maybeSingle();
  if (existing) {
    return jsonError("An account with that email already exists.", 409);
  }

  const userId = `u-${Date.now()}`;
  // New accounts get a default password so they can sign in.
  const { error: userErr } = await supabaseAdmin.from("users").insert({
    id: userId,
    name: body.fullName,
    role: "officer",
    rank: body.rank,
    email: body.email,
    password: "changeme123",
  });
  if (userErr) return jsonError("Failed to create the account.", 500);

  const personnelId = `p-${Date.now()}`;
  const joinDate = body.joinDate || todayLocal();
  const { data } = await supabaseAdmin
    .from("personnel")
    .insert({
      id: personnelId,
      user_id: userId,
      full_name: body.fullName,
      rank: body.rank,
      // Cached mirror of the computed value (source of truth is the join date).
      service_years: computeServiceYears(joinDate),
      join_date: joinDate,
      status: "active",
      promotion_history: [],
    })
    .select("*")
    .maybeSingle();
  const createdPersonnel = data ? mapPersonnel(data) : null;

  await audit(actorId, "account.created.officer", "user", userId);
  return NextResponse.json({ personnel: createdPersonnel }, { status: 201 });
}
