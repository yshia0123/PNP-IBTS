import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapAuditLog } from "@/lib/db-mappers";

// Read-only, newest-first audit log.
export async function GET() {
  const { data } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .order("timestamp", { ascending: false });
  return NextResponse.json((data ?? []).map(mapAuditLog));
}
