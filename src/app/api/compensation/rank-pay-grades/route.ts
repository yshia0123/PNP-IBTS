import { NextResponse } from "next/server";
import type { RankPayGrade } from "@/lib/types";
import rankPayGrades from "../../../../../mock-data/rankPayGrades.json";

/**
 * Rank-based salary reference data (Salary & Compensation module).
 *
 * Static reference data seeded from mock-data/rankPayGrades.json (Executive
 * No. 107, 2nd Tranche, effective Jan 1 2027). Served through the API layer so
 * the frontend uses the same request/response code path as every other module
 * (SSOT Section 3.3). The seed's array ORDER is preserved end-to-end — NUP is
 * intentionally first, ahead of PGEN — so callers must NOT re-sort it.
 */
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(rankPayGrades as RankPayGrade[]);
}
