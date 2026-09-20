import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapPersonnel } from "@/lib/db-mappers";
import { audit, currentUserId, jsonError } from "@/lib/api-helpers";
import { computeServiceYears } from "@/lib/format";

// Admin / HR edits a personnel record.
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as Partial<{
    fullName: string;
    rank: string;
    joinDate: string;
    separationDate: string | null;
    status: "active" | "retired" | "separated";
  }>;

  const patch: Record<string, unknown> = {};
  if (body.fullName !== undefined) patch.full_name = body.fullName;
  if (body.rank !== undefined) patch.rank = body.rank;
  if (body.joinDate !== undefined) patch.join_date = body.joinDate;
  if (body.separationDate !== undefined) {
    patch.separation_date = body.separationDate || null;
  }
  if (body.status !== undefined) {
    patch.status = body.status;
    // Clear separation date when a person is set back to active.
    if (body.status === "active" && body.separationDate === undefined) {
      patch.separation_date = null;
    }
  }

  // First apply the edits, then re-read to recompute and cache service_years
  // from the resulting join/separation dates (the column is a mirror only).
  const { data: updated, error } = await supabaseAdmin
    .from("personnel")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !updated) return jsonError("Personnel record not found.", 404);

  const computedYears = computeServiceYears(
    updated.join_date,
    updated.separation_date
  );
  const { data: mirrored } = await supabaseAdmin
    .from("personnel")
    .update({ service_years: computedYears })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  const row = mirrored ?? updated;

  // Keep the linked user's display name/rank in sync.
  const userPatch: Record<string, unknown> = {};
  if (body.fullName !== undefined) userPatch.name = body.fullName;
  if (body.rank !== undefined) userPatch.rank = body.rank;
  if (Object.keys(userPatch).length > 0) {
    await supabaseAdmin.from("users").update(userPatch).eq("id", row.user_id);
  }

  await audit(
    currentUserId(request) ?? "unknown",
    "personnel.record.updated",
    "personnel",
    id
  );
  return NextResponse.json(mapPersonnel(row));
}
