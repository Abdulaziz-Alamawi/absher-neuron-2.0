import { NextRequest, NextResponse } from "next/server";
import { getSessions } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = Math.min(100, Number(new URL(req.url).searchParams.get("limit")) || 18);
  const { source, sessions } = await getSessions(limit);
  return NextResponse.json({ source, count: sessions.length, sessions });
}
