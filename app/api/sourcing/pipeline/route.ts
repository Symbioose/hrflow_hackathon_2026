import { NextRequest, NextResponse } from "next/server";
import { sourcing } from "@/app/lib/sourcing";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // Trigger the pipeline. 
    // In a serverless env, we'd normally use a background job or stream.
    // For the hackathon dashboard, we trigger events back to the webhook to update the UI.
    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const webhookUrl = new URL("/api/openclaw/webhook", base).toString();

    const onEvent = async (event: any) => {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event)
      });
    };

    // Run async without awaiting the whole thing to return fast to the UI
    sourcing.runJitPipeline(query, onEvent).then(async () => {
      await onEvent({ channel: "action", payload: { command: "pipeline_done" } });
    });

    return NextResponse.json({ message: "Pipeline started", query }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
