import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapClaim } from "@/lib/db-mappers";
import {
  audit,
  currentUserId,
  jsonError,
  todayLocal,
} from "@/lib/api-helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Enrich a claim row with claimant name + benefit label for display.
async function enrich(claims: any[]) {
  const personnelIds = [...new Set(claims.map((c) => c.personnel_id))];
  const benefitIds = [...new Set(claims.map((c) => c.benefit_id).filter(Boolean))];

  const [{ data: people }, { data: benefits }] = await Promise.all([
    supabaseAdmin.from("personnel").select("id, full_name").in("id", personnelIds),
    benefitIds.length
      ? supabaseAdmin.from("benefits").select("id, label").in("id", benefitIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const nameById = new Map((people ?? []).map((p) => [p.id, p.full_name]));
  const labelById = new Map((benefits ?? []).map((b) => [b.id, b.label]));

  return claims.map((c) => ({
    ...mapClaim(c),
    claimantName: nameById.get(c.personnel_id) ?? c.personnel_id,
    benefitLabel: labelById.get(c.benefit_id) ?? c.benefit_id,
  }));
}

// List claims — admin/HR see all; everyone else sees only their own.
export async function GET(request: Request) {
  const userId = currentUserId(request);
  if (!userId) return NextResponse.json([]);

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const seesAll = user?.role === "admin" || user?.role === "hr_manager";

  let claims: any[] = [];
  if (seesAll) {
    const { data } = await supabaseAdmin
      .from("claims")
      .select("*")
      .order("created_at", { ascending: false });
    claims = data ?? [];
  } else {
    const { data: person } = await supabaseAdmin
      .from("personnel")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (person) {
      const { data } = await supabaseAdmin
        .from("claims")
        .select("*")
        .eq("personnel_id", person.id)
        .order("created_at", { ascending: false });
      claims = data ?? [];
    }
  }

  return NextResponse.json(await enrich(claims));
}

// Submit a new claim (officer / retiree).
export async function POST(request: Request) {
  const userId = currentUserId(request);
  if (!userId) return jsonError("Not signed in.", 401);

  const { data: person } = await supabaseAdmin
    .from("personnel")
    .select("id, full_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (!person) {
    return jsonError("No personnel record linked to this account.", 400);
  }

  const body = (await request.json().catch(() => ({}))) as {
    benefitId?: string;
    notes?: string;
  };
  if (!body.benefitId) return jsonError("A benefit must be selected.", 422);

  const claimId = `c-${Date.now()}`;
  const { data, error } = await supabaseAdmin
    .from("claims")
    .insert({
      id: claimId,
      personnel_id: person.id,
      benefit_id: body.benefitId,
      status: "submitted",
      submitted_date: todayLocal(),
      notes: body.notes ?? null,
    })
    .select("*")
    .maybeSingle();
  if (error || !data) return jsonError("Failed to submit claim.", 500);

  await audit(userId, "claim.submitted", "claim", claimId);

  // Notify the submitter + all admins.
  const { data: admins } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("role", "admin");

  const now = new Date().toISOString();
  const notifications = [
    {
      id: `n-${Date.now()}-self`,
      user_id: userId,
      type: "info",
      title: "Claim Request Submitted",
      message: `Your claim request (${claimId}) was submitted and is awaiting review.`,
      read: false,
      created_at: now,
    },
    ...(admins ?? []).map((a, i) => ({
      id: `n-${Date.now()}-${i}-${a.id}`,
      user_id: a.id,
      type: "action_required",
      title: "New Claim Submitted",
      message: `${person.full_name} submitted a new claim (${claimId}).`,
      read: false,
      created_at: now,
    })),
  ];
  await supabaseAdmin.from("notifications").insert(notifications);

  const [enriched] = await (async () => {
    const { data: benefit } = await supabaseAdmin
      .from("benefits")
      .select("label")
      .eq("id", body.benefitId!)
      .maybeSingle();
    return [
      {
        ...mapClaim(data),
        claimantName: person.full_name,
        benefitLabel: benefit?.label ?? body.benefitId,
      },
    ];
  })();

  return NextResponse.json(enriched, { status: 201 });
}
