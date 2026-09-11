import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapDependent } from "@/lib/db-mappers";
import { audit, currentUserId, jsonError, todayLocal } from "@/lib/api-helpers";

// Dependent requests re-verification (resubmits documents).
export async function POST(request: Request) {
  const userId = currentUserId(request);
  if (!userId) return jsonError("Not signed in.", 401);

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("name")
    .eq("id", userId)
    .maybeSingle();
  const { data: dependents } = user
    ? await supabaseAdmin
        .from("dependents")
        .select("*")
        .ilike("full_name", user.name)
    : { data: null };
  const dependent = dependents?.[0];
  if (!dependent) {
    return jsonError("No dependent record linked to this account.", 404);
  }

  const { data, error } = await supabaseAdmin
    .from("dependents")
    .update({ verification_status: "pending", requested_date: todayLocal() })
    .eq("id", dependent.id)
    .select("*")
    .maybeSingle();
  if (error || !data) return jsonError("Failed to submit request.", 500);

  await audit(userId, "dependent.verification_requested", "dependent", dependent.id);

  const { data: admins } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("role", "admin");
  const now = new Date().toISOString();
  if (admins?.length) {
    await supabaseAdmin.from("notifications").insert(
      admins.map((a, i) => ({
        id: `n-${Date.now()}-${i}-${a.id}`,
        user_id: a.id,
        type: "action_required",
        title: "Dependent Verification Requested",
        message: `${dependent.full_name} resubmitted documents for verification.`,
        read: false,
        created_at: now,
      }))
    );
  }

  return NextResponse.json(mapDependent(data));
}
