import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapPersonnel } from "@/lib/db-mappers";

// Retired personnel.
export async function GET() {
  const { data } = await supabaseAdmin
    .from("personnel")
    .select("*")
    .eq("status", "retired");
  return NextResponse.json((data ?? []).map(mapPersonnel));
}
