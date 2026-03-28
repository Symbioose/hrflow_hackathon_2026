import { NextRequest, NextResponse } from "next/server";
import { hrflow } from "@/app/lib/hrflow";

/** GET /api/hrflow/score?job_key=...&limit=...&page=... — Score profiles against a job */
export async function GET(req: NextRequest) {
  const ALGORITHM_KEY = process.env.HRFLOW_ALGORITHM_KEY;
  if (!ALGORITHM_KEY) {
    return NextResponse.json(
      { error: "Scoring non disponible : HRFLOW_ALGORITHM_KEY manquante. Creer un algorithme dans AI Studio." },
      { status: 503 },
    );
  }

  const { searchParams } = req.nextUrl;
  const jobKey = searchParams.get("job_key");
  const limit = searchParams.get("limit");
  const page = searchParams.get("page");

  if (!jobKey) {
    return NextResponse.json({ error: "Missing job_key parameter" }, { status: 400 });
  }

  const result = await hrflow.scoreProfiles(jobKey, ALGORITHM_KEY, {
    limit: limit ? parseInt(limit, 10) : undefined,
    page: page ? parseInt(page, 10) : undefined,
  });

  return NextResponse.json(result, { status: result.code ?? 500 });
}
