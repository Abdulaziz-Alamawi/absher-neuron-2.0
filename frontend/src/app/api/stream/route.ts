import { syntheticEvent } from "@/lib/realtime/simulator";

export const dynamic = "force-dynamic";

/**
 * GET /api/stream — Server-Sent Events fallback for the live threat stream.
 * Used when the FastAPI WebSocket gateway is not deployed.
 */
export async function GET() {
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const event = syntheticEvent();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      send();
      timer = setInterval(send, 2500);
    },
    cancel() {
      clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
