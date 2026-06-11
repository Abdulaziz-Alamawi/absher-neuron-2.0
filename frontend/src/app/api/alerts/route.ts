import { NextRequest, NextResponse } from "next/server";
import { getAlerts } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Number(searchParams.get("limit")) || 24);
  const severity = searchParams.get("severity") ?? undefined;
  const { source, alerts } = await getAlerts({ limit, severity });
  return NextResponse.json({ source, count: alerts.length, alerts });
}
