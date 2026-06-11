import { NextResponse } from "next/server";
import { isDatabaseReady } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbReady = await isDatabaseReady();
  return NextResponse.json({
    status: "operational",
    service: "absher-neuron-frontend",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "2.0.0",
    owner: "Abdulaziz AlAmawi",
    components: {
      web: "up",
      scoring_engine: "up",
      database: dbReady ? "connected" : "fallback-generator",
      ai_gateway: process.env.NEXT_PUBLIC_AI_WS_URL ? "configured" : "fallback-simulation",
    },
    timestamp: new Date().toISOString(),
  });
}
