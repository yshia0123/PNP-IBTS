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

// Admin creates a new account (officer / retiree / dependent).
export async function POST(request: Request) {
  const actorId = currentUserId(request) ?? "unknown";
  const body = (await request.json().catch(() => ({}))) as {
    fullName?: string;
    email?: string;
    role?: "officer" | "retiree" | "dependent";
    rank?: string;
    joinDate?: string;
    separationDate?: string | null;
    relationship?: "spouse" | "child" | "parent" | "other";
    sponsorPersonnelId?: string;
  };

  if (!body.fullName || !body.email || !body.role) {
    return jsonError("Name, email, and role are required.", 422);
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
    role: body.role,
    rank: body.rank ?? null,
    email: body.email,
    password: "changeme123",
  });
  if (userErr) return jsonError("Failed to create the account.", 500);

  let createdPersonnel = null;
  if (body.role === "officer" || body.role === "retiree") {
    const personnelId = `p-${Date.now()}`;
    const joinDate = body.joinDate || todayLocal();
    const separationDate =
      body.role === "retiree" ? body.separationDate || null : null;
    const { data } = await supabaseAdmin
      .from("personnel")
      .insert({
        id: personnelId,
        user_id: userId,
        full_name: body.fullName,
        rank: body.rank ?? "N/A",
        // Cached mirror of the computed value (source of truth is the dates).
        service_years: computeServiceYears(joinDate, separationDate),
        join_date: joinDate,
        separation_date: separationDate,
        status: body.role === "retiree" ? "retired" : "active",
        promotion_history: [],
      })
      .select("*")
      .maybeSingle();
    createdPersonnel = data ? mapPersonnel(data) : null;
  } else if (body.role === "dependent") {
    await supabaseAdmin.from("dependents").insert({
      id: `d-${Date.now()}`,
      personnel_id: body.sponsorPersonnelId ?? null,
      full_name: body.fullName,
      relationship: body.relationship ?? "other",
      verification_status: "unverified",
      requested_date: todayLocal(),
    });
  }

  await audit(actorId, `account.created.${body.role}`, "user", userId);
  return NextResponse.json({ personnel: createdPersonnel }, { status: 201 });
}
