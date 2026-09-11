import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapBenefit, mapDependent } from "@/lib/db-mappers";
import { currentUserId, jsonError } from "@/lib/api-helpers";

// Dependent self-service: their record, sponsor, and beneficiary benefits.
export async function GET(request: Request) {
  const userId = currentUserId(request);
  if (!userId) return jsonError("Not signed in.", 401);

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("name")
    .eq("id", userId)
    .maybeSingle();
  if (!user) return jsonError("User not found.", 404);

  const { data: dependents } = await supabaseAdmin
    .from("dependents")
    .select("*")
    .ilike("full_name", user.name);
  const dependent = dependents?.[0];
  if (!dependent) {
    return jsonError("No dependent record linked to this account.", 404);
  }

  const { data: sponsor } = await supabaseAdmin
    .from("personnel")
    .select("full_name, rank")
    .eq("id", dependent.personnel_id)
    .maybeSingle();

  const { data: benefits } = await supabaseAdmin
    .from("benefits")
    .select("*")
    .eq("personnel_id", dependent.personnel_id)
    .eq("type", "insurance");

  return NextResponse.json({
    dependent: mapDependent(dependent),
    sponsorName: sponsor?.full_name ?? null,
    sponsorRank: sponsor?.rank ?? null,
    beneficiaryBenefits: (benefits ?? []).map(mapBenefit),
  });
}
