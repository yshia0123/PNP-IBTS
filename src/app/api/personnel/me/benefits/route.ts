import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapBenefit } from "@/lib/db-mappers";
import { currentUserId } from "@/lib/api-helpers";

// Benefits for the signed-in user's personnel record.
export async function GET(request: Request) {
  const userId = currentUserId(request);
  if (!userId) return NextResponse.json([]);

  const { data: person } = await supabaseAdmin
    .from("personnel")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!person) return NextResponse.json([]);

  const { data } = await supabaseAdmin
    .from("benefits")
    .select("*")
    .eq("personnel_id", person.id);

  return NextResponse.json((data ?? []).map(mapBenefit));
}
