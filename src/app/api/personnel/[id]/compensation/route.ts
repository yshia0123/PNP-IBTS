import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapPersonnel } from "@/lib/db-mappers";
import { audit, currentUser, jsonError } from "@/lib/api-helpers";
import {
  computeCompensationProfile,
  EMPTY_COMPENSATION_INPUTS,
  type CompensationProfileInputs,
} from "@/lib/compensation";
import type { RankPayGrade } from "@/lib/types";
import rankPayGrades from "../../../../../../mock-data/rankPayGrades.json";

/** Look up a rank's pay grade row; falls back to zeros when unknown. */
function gradeFor(rank: string): { basePay: number; salaryGrade: number } {
  const grades = rankPayGrades as RankPayGrade[];
  const g = grades.find((x) => x.rank === rank);
  return { basePay: g?.basePay ?? 0, salaryGrade: g?.salaryGrade ?? 0 };
}

/**
 * GET a person's compensation: the saved Admin inputs plus a fully computed
 * "tentative" profile derived from their rank + years of service. HR and Admin
 * may read (compensation.read); other roles are denied.
 */
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const user = await currentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "hr_manager")) {
    return jsonError("Not authorized to view compensation.", 403);
  }

  const { data, error } = await supabaseAdmin
    .from("personnel")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return jsonError("Personnel record not found.", 404);

  const person = mapPersonnel(data);
  const inputs: CompensationProfileInputs = {
    ...EMPTY_COMPENSATION_INPUTS,
    ...(person.compensation ?? {}),
  };
  const { basePay: tableBasePay, salaryGrade } = gradeFor(person.rank);
  const computed = computeCompensationProfile({
    rank: person.rank,
    tableBasePay,
    yearsOfActiveService: person.serviceYears,
    inputs,
  });

  return NextResponse.json({
    person,
    inputs,
    tableBasePay,
    salaryGrade,
    computed,
  });
}

/**
 * PATCH a person's compensation inputs. Admin-only (compensation.override).
 * Only the Admin-entered situational fields are persisted; computed values are
 * never stored. Returns the recomputed profile so the client re-renders live.
 */
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const user = await currentUser(request);
  if (!user || user.role !== "admin") {
    return jsonError("Only Admin may edit compensation.", 403);
  }

  const body = (await request.json().catch(() => ({}))) as Partial<
    CompensationProfileInputs & { payslipAccountNo: string | null }
  >;

  const { data: existing, error: readErr } = await supabaseAdmin
    .from("personnel")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readErr || !existing) {
    return jsonError("Personnel record not found.", 404);
  }

  const person = mapPersonnel(existing);
  // Merge onto the existing saved inputs so partial patches are supported.
  const merged: CompensationProfileInputs = {
    ...EMPTY_COMPENSATION_INPUTS,
    ...(person.compensation ?? {}),
    ...sanitize(body),
  };

  // payslip account number is a personnel column (not a computed input).
  const patch: Record<string, unknown> = { compensation: merged };
  if ("payslipAccountNo" in body) {
    const raw =
      typeof body.payslipAccountNo === "string"
        ? body.payslipAccountNo.trim()
        : "";
    patch.payslip_account_no = raw === "" ? null : raw;
  }

  const { data, error } = await supabaseAdmin
    .from("personnel")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return jsonError("Failed to save compensation.", 500);

  const saved = mapPersonnel(data);
  const { basePay: tableBasePay, salaryGrade } = gradeFor(saved.rank);
  const computed = computeCompensationProfile({
    rank: saved.rank,
    tableBasePay,
    yearsOfActiveService: saved.serviceYears,
    inputs: merged,
  });

  await audit(user.id, "compensation.updated", "personnel", id);
  return NextResponse.json({
    person: saved,
    inputs: merged,
    tableBasePay,
    salaryGrade,
    computed,
  });
}

/** Coerce/clamp incoming values so bad client input can't corrupt the row. */
function sanitize(
  body: Partial<CompensationProfileInputs>
): Partial<CompensationProfileInputs> {
  const out: Partial<CompensationProfileInputs> = {};

  if ("hazardousDutyPct" in body) {
    out.hazardousDutyPct = clamp(numOrNull(body.hazardousDutyPct) ?? 0, 0, 0.5);
  }
  if ("combatDuty" in body) out.combatDuty = Boolean(body.combatDuty);
  if ("combatIncentiveDays" in body) {
    out.combatIncentiveDays = Math.max(
      0,
      Math.floor(numOrNull(body.combatIncentiveDays) ?? 0)
    );
  }
  if ("hardshipPct" in body) {
    out.hardshipPct = clamp(numOrNull(body.hardshipPct) ?? 0, 0, 0.25);
  }
  if ("clothingAllowance" in body) {
    out.clothingAllowance = Math.max(0, numOrNull(body.clothingAllowance) ?? 0);
  }
  if ("laundryAllowance" in body) {
    out.laundryAllowance = Math.max(0, numOrNull(body.laundryAllowance) ?? 0);
  }
  if ("trainingSubsistence" in body) {
    out.trainingSubsistence = Math.max(
      0,
      numOrNull(body.trainingSubsistence) ?? 0
    );
  }
  return out;
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
