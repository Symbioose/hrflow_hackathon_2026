import { subscribe, getEventsSince } from "@/app/lib/eventStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/openclaw/stream
 * Server-Sent Events stream — pushes events to the dashboard in <200ms.
 *
 * Query params:
 *   cursor (optional): last event id seen (to catch up on missed events)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cursor = parseInt(url.searchParams.get("cursor") ?? "0", 10);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send any events missed since cursor immediately
      const { events: missed } = getEventsSince(cursor);
      for (const event of missed) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      // Subscribe to new events
      const unsubscribe = subscribe((event) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          unsubscribe();
        }
      });

      // Heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 15_000);

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
