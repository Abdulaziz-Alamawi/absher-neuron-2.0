import { NextRequest, NextResponse } from "next/server";
import { getThreats } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Number(searchParams.get("limit")) || 60);
  const severity = searchParams.get("severity") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const { source, threats, distribution, geo } = await getThreats({ limit, severity, category });

  return NextResponse.json({ source, count: threats.length, distribution, geo, threats });
}
