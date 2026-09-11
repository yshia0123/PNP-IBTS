import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapPersonnel } from "@/lib/db-mappers";
import { currentUserId } from "@/lib/api-helpers";

// Personnel record for the signed-in user (dashboard hero + portfolio).
export async function GET(request: Request) {
  const userId = currentUserId(request);
  if (!userId) return NextResponse.json(null);

  const { data } = await supabaseAdmin
    .from("personnel")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // No personnel record (e.g. a dependent) is a valid state → null.
  if (!data) return NextResponse.json(null);

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("division")
    .eq("id", userId)
    .maybeSingle();

  return NextResponse.json({
    ...mapPersonnel(data),
    division: user?.division ?? undefined,
  });
}
