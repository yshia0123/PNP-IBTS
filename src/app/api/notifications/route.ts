import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapNotification } from "@/lib/db-mappers";
import { currentUserId } from "@/lib/api-helpers";

// Notifications for the signed-in user, newest first.
export async function GET(request: Request) {
  const userId = currentUserId(request);
  if (!userId) return NextResponse.json([]);

  const { data } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return NextResponse.json((data ?? []).map(mapNotification));
}
