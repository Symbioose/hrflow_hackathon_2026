import { NextRequest, NextResponse } from "next/server";

const OPENCLAW_WEBHOOK_URL = process.env.OPENCLAW_WEBHOOK_URL;

/**
 * POST /api/openclaw/trigger
 * Sends the recruiter's search query to OpenClaw to start sourcing.
 *
 * Body: { "query": "Data Scientist Paris 5 ans" }
 * Response: { "ok": true } or { "ok": false, "error": "..." }
 *
 * Returns 503 if OPENCLAW_WEBHOOK_URL is not configured — dashboard
 * will automatically fall back to demo profiles.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ ok: false, error: "Missing query" }, { status: 400 });
    }

    if (!OPENCLAW_WEBHOOK_URL) {
      return NextResponse.json({ ok: false, error: "OPENCLAW_WEBHOOK_URL not set" }, { status: 503 });
    }

    const res = await fetch(OPENCLAW_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `OpenClaw returned ${res.status}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
