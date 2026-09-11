import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// Health check: confirms the API and Supabase connection are reachable.
export async function GET() {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({
      status: "ok",
      service: "IBTS API",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
