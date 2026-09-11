import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapClaim } from "@/lib/db-mappers";
import { audit, currentUserId, jsonError } from "@/lib/api-helpers";

// Start review: submitted -> under_review, stamps reviewed_at.
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const actorId = currentUserId(request) ?? "unknown";

  const { data: existing } = await supabaseAdmin
    .from("claims")
    .select("status, personnel_id, benefit_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return jsonError("Claim not found.", 404);
  if (existing.status !== "submitted") {
    return jsonError(`Cannot start review on a ${existing.status} claim.`, 409);
  }

  const { data, error } = await supabaseAdmin
    .from("claims")
    .update({
      status: "under_review",
      reviewed_by: actorId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) return jsonError("Claim not found.", 404);

  await audit(actorId, "claim.review_started", "claim", id);

  const [{ data: person }, { data: benefit }] = await Promise.all([
    supabaseAdmin
      .from("personnel")
      .select("full_name")
      .eq("id", data.personnel_id)
      .maybeSingle(),
    data.benefit_id
      ? supabaseAdmin
          .from("benefits")
          .select("label")
          .eq("id", data.benefit_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return NextResponse.json({
    ...mapClaim(data),
    claimantName: person?.full_name ?? data.personnel_id,
    benefitLabel: benefit?.label ?? data.benefit_id,
  });
}
