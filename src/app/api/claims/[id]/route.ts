import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapClaim } from "@/lib/db-mappers";
import { audit, currentUserId, jsonError } from "@/lib/api-helpers";
import type { ClaimStatus } from "@/lib/types";

// Decision on a claim (approve / reject / update).
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const actorId = currentUserId(request) ?? "unknown";
  const body = (await request.json().catch(() => ({}))) as {
    status?: ClaimStatus;
    notes?: string;
    reviewedBy?: string;
  };

  const patch: Record<string, unknown> = { reviewed_by: body.reviewedBy ?? actorId };
  if (body.status) patch.status = body.status;
  if (body.notes !== undefined) patch.notes = body.notes;

  const { data, error } = await supabaseAdmin
    .from("claims")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) return jsonError("Claim not found.", 404);

  await audit(actorId, `claim.${body.status ?? "updated"}`, "claim", id);
  return NextResponse.json(mapClaim(data));
}
