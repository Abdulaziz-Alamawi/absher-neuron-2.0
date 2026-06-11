import { NextRequest, NextResponse } from "next/server";
import { getPolicies } from "@/lib/db/repositories";
import { requireAuth } from "@/lib/auth/guard";
import { prisma, isDatabaseReady } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { source, policies } = await getPolicies();
  return NextResponse.json({ source, count: policies.length, policies });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req, "manage_policies");
  if ("error" in auth) return auth.error!;
  const { user } = auth;

  const body = await req.json();
  const { key, enabled } = body as { key?: string; enabled?: boolean };
  if (!key || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "key and enabled required." }, { status: 400 });
  }

  if (await isDatabaseReady()) {
    const policy = await prisma.securityPolicy.update({ where: { key }, data: { enabled } });
    return NextResponse.json({ updated: true, policy, actor: user.name });
  }
  return NextResponse.json({ updated: true, key, enabled, actor: user.name, note: "generator mode" });
}
