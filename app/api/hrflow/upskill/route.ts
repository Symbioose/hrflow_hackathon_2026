import { NextRequest, NextResponse } from "next/server";
import { hrflow } from "@/app/lib/hrflow";

/** GET /api/hrflow/upskill?profile_key=...&job_key=... — SWOT analysis of profile↔job matching */
export async function GET(req: NextRequest) {
  const algorithmKey = process.env.HRFLOW_ALGORITHM_KEY;
  if (!algorithmKey) {
    return NextResponse.json(
      { error: "Upskilling non disponible : HRFLOW_ALGORITHM_KEY manquante." },
      { status: 503 },
    );
  }

  const { searchParams } = req.nextUrl;
  const profileKey = searchParams.get("profile_key");
  const jobKey = searchParams.get("job_key");

  if (!profileKey || !jobKey) {
    return NextResponse.json({ error: "Missing profile_key or job_key parameter" }, { status: 400 });
  }

  const result = await hrflow.upskillProfile(profileKey, jobKey, algorithmKey);
  return NextResponse.json(result, { status: result.code ?? 500 });
}
