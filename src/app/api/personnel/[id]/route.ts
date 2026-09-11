import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapPersonnel } from "@/lib/db-mappers";
import { audit, currentUserId, jsonError } from "@/lib/api-helpers";

// Admin / HR edits a personnel record.
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as Partial<{
    fullName: string;
    rank: string;
    serviceYears: number;
    joinDate: string;
    status: "active" | "retired" | "separated";
  }>;

  const patch: Record<string, unknown> = {};
  if (body.fullName !== undefined) patch.full_name = body.fullName;
  if (body.rank !== undefined) patch.rank = body.rank;
  if (body.serviceYears !== undefined) patch.service_years = body.serviceYears;
  if (body.joinDate !== undefined) patch.join_date = body.joinDate;
  if (body.status !== undefined) patch.status = body.status;

  const { data, error } = await supabaseAdmin
    .from("personnel")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) return jsonError("Personnel record not found.", 404);

  // Keep the linked user's display name/rank in sync.
  const userPatch: Record<string, unknown> = {};
  if (body.fullName !== undefined) userPatch.name = body.fullName;
  if (body.rank !== undefined) userPatch.rank = body.rank;
  if (Object.keys(userPatch).length > 0) {
    await supabaseAdmin.from("users").update(userPatch).eq("id", data.user_id);
  }

  await audit(
    currentUserId(request) ?? "unknown",
    "personnel.record.updated",
    "personnel",
    id
  );
  return NextResponse.json(mapPersonnel(data));
}
