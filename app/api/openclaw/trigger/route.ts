import { NextRequest, NextResponse } from "next/server";

const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL;
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

/**
 * POST /api/openclaw/trigger
 * Sends the recruiter's search query to OpenClaw to start sourcing.
 *
 * Body: { "query": "Data Scientist Paris 5 ans" }
 * Response: { "ok": true } or { "ok": false, "error": "..." }
 *
 * Returns 503 if OPENCLAW_GATEWAY_URL is not configured — dashboard
 * will automatically fall back to demo profiles.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ ok: false, error: "Missing query" }, { status: 400 });
    }

    if (!OPENCLAW_GATEWAY_URL) {
      return NextResponse.json({ ok: false, error: "OPENCLAW_GATEWAY_URL not set" }, { status: 503 });
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (OPENCLAW_GATEWAY_TOKEN) {
      headers["Authorization"] = `Bearer ${OPENCLAW_GATEWAY_TOKEN}`;
    }

    const res = await fetch(`${OPENCLAW_GATEWAY_URL}/api/v1/messages/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({ channel: "webchat", target: "main", message: query }),
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
