import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = Math.min(200, Number(new URL(req.url).searchParams.get("limit")) || 40);
  const { source, logs } = await getAuditLogs(limit);
  return NextResponse.json({ source, count: logs.length, logs });
}
