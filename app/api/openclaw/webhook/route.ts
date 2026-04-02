import { NextRequest, NextResponse } from "next/server";
import { pushEvent, type OpenClawEvent } from "@/app/lib/eventStore";

/**
 * POST /api/openclaw/webhook — Receive events from OpenClaw
 *
 * Supported channels: "chat" | "feed" | "action" | "profile"
 *
 * Profile example:
 * {"channel":"profile","payload":{"profile":{...SourcedProfile...}}}
 *
 * Batch profiles shorthand:
 * {"profiles":[{...SourcedProfile...}, ...]}
 *
 * All other formats unchanged.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.OPENCLAW_WEBHOOK_SECRET;
  if (secret) {
    const provided = req.headers.get("x-openclaw-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await req.json();

    // Batch profiles shorthand: {"profiles": [...]}
    if (Array.isArray(body.profiles)) {
      const created = body.profiles.map((profile: unknown) =>
        pushEvent("profile", { profile: profile as OpenClawEvent["payload"]["profile"] }),
      );
      return NextResponse.json({ code: 200, message: "OK", count: created.length });
    }

    // Standard single or batch events
    const items: { channel: OpenClawEvent["channel"]; payload: OpenClawEvent["payload"] }[] =
      body.events ?? [body];

    const created = items.map((item) => pushEvent(item.channel, item.payload));
    return NextResponse.json({ code: 200, message: "OK", count: created.length });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
