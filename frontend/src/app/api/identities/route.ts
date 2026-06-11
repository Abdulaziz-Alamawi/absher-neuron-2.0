import { NextRequest, NextResponse } from "next/server";
import { getIdentities } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limit = Math.min(100, Number(new URL(req.url).searchParams.get("limit")) || 28);
  const { source, users } = await getIdentities(limit);
  return NextResponse.json({ source, count: users.length, users });
}
