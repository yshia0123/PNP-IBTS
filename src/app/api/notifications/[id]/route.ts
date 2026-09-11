import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapNotification } from "@/lib/db-mappers";
import { jsonError } from "@/lib/api-helpers";

// Mark a notification as read (or unread).
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { read?: boolean };

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .update({ read: body.read ?? true })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) return jsonError("Notification not found.", 404);
  return NextResponse.json(mapNotification(data));
}

// Dismiss (delete) a notification.
export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await supabaseAdmin.from("notifications").delete().eq("id", id);
  return new NextResponse(null, { status: 204 });
}
