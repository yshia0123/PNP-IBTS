import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { currentUserId } from "@/lib/api-helpers";

interface Result {
  type: "personnel" | "claim" | "retiree";
  id: string;
  label: string;
  sublabel: string;
  href: string;
}

// Role-scoped global search across personnel, claims, and retirees.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) return NextResponse.json([]);

  const userId = currentUserId(request);
  const { data: user } = userId
    ? await supabaseAdmin.from("users").select("role").eq("id", userId).maybeSingle()
    : { data: null };
  const role = user?.role ?? "dependent";

  const canPersonnel = role === "admin" || role === "hr_manager";
  const canClaims = role === "admin" || role === "hr_manager";
  const canRetirees =
    role === "admin" || role === "hr_manager" || role === "retiree";

  const results: Result[] = [];

  if (canPersonnel) {
    const { data } = await supabaseAdmin
      .from("personnel")
      .select("id, full_name, rank")
      .or(`full_name.ilike.%${q}%,rank.ilike.%${q}%`);
    for (const p of data ?? []) {
      results.push({
        type: "personnel",
        id: p.id,
        label: p.full_name,
        sublabel: `${p.rank} · Personnel`,
        href: "/personnel",
      });
    }
  }

  if (canClaims) {
    const { data } = await supabaseAdmin.from("claims").select("id, status, personnel_id");
    const ids = [...new Set((data ?? []).map((c) => c.personnel_id))];
    const { data: people } = ids.length
      ? await supabaseAdmin.from("personnel").select("id, full_name").in("id", ids)
      : { data: [] };
    const nameById = new Map((people ?? []).map((p) => [p.id, p.full_name]));
    for (const c of data ?? []) {
      const name = nameById.get(c.personnel_id) ?? "";
      const hay = `${c.id} ${c.status} ${name}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "claim",
          id: c.id,
          label: `Claim ${c.id}`,
          sublabel: `${name} · ${c.status.replace("_", " ")}`,
          href: "/claims",
        });
      }
    }
  }

  if (canRetirees) {
    const { data } = await supabaseAdmin
      .from("personnel")
      .select("id, full_name, rank")
      .eq("status", "retired")
      .ilike("full_name", `%${q}%`);
    for (const p of data ?? []) {
      results.push({
        type: "retiree",
        id: `ret-${p.id}`,
        label: p.full_name,
        sublabel: `${p.rank} · Retiree`,
        href: "/retirees",
      });
    }
  }

  return NextResponse.json(results.slice(0, 8));
}
