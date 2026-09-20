import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { mapPersonnel } from "@/lib/db-mappers";
import { currentUserId, jsonError } from "@/lib/api-helpers";
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
 * The signed-in user's OWN computed compensation (read-only), for the
 * dashboard. Reuses the exact same computation as the admin editor so the two
 * always agree — when an Admin saves an edit, this reflects it on next load.
 * Returns null when the user has no personnel record (e.g. a dependent).
 */
export async function GET(request: Request) {
  const userId = currentUserId(request);
  if (!userId) return jsonError("Not signed in.", 401);

  const { data, error } = await supabaseAdmin
    .from("personnel")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return jsonError("Failed to load compensation.", 500);
  if (!data) return NextResponse.json(null);

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
