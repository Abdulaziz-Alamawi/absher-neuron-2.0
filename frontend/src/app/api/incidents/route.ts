import { NextRequest, NextResponse } from "next/server";
import { getIncidents } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = Math.min(50, Number(new URL(req.url).searchParams.get("limit")) || 9);
  const { source, incidents } = await getIncidents(limit);
  return NextResponse.json({ source, count: incidents.length, incidents });
}
