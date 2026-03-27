import { NextRequest, NextResponse } from "next/server";
import { hrflow } from "@/app/lib/hrflow";

/** GET /api/hrflow/score?job_key=...&limit=...&page=... — Score profiles against a job */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const jobKey = searchParams.get("job_key");
  const limit = searchParams.get("limit");
  const page = searchParams.get("page");

  if (!jobKey) {
    return NextResponse.json({ error: "Missing job_key parameter" }, { status: 400 });
  }

  const result = await hrflow.scoreProfiles(jobKey, {
    limit: limit ? parseInt(limit, 10) : undefined,
    page: page ? parseInt(page, 10) : undefined,
  });

  return NextResponse.json(result, { status: result.code });
}
