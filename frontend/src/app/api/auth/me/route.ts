import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("error" in auth && auth.error) return auth.error;
  return NextResponse.json({ user: auth.user });
}
