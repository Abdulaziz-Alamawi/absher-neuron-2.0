import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth/jwt";
import { prisma, isDatabaseReady } from "@/lib/db/prisma";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEMO_USERS: Record<string, { password: string; name: string; email: string; role: Role; id: string }> = {
  "abdulaziz@absher.sa": {
    password: "neuron2026",
    name: "Abdulaziz AlAmawi",
    email: "abdulaziz@absher.sa",
    role: "superadmin",
    id: "usr_owner",
  },
  "analyst@absher.sa": {
    password: "neuron2026",
    name: "Sara AlQahtani",
    email: "analyst@absher.sa",
    role: "analyst",
    id: "usr_analyst",
  },
};

const ROLE_MAP: Record<string, Role> = {
  SUPERADMIN: "superadmin", ADMIN: "admin", ANALYST: "analyst",
  RESPONDER: "responder", AUDITOR: "auditor",
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required." }, { status: 400 });
  }

  if (await isDatabaseReady()) {
    const identity = await prisma.identity.findUnique({ where: { email } });
    if (!identity) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    // Demo: password check against fixed demo secret for seeded users
    if (password !== "neuron2026") {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
    const role = ROLE_MAP[identity.role] ?? "analyst";
    const token = await signToken({ sub: identity.id, name: identity.name, email: identity.email, role });
    return NextResponse.json({
      token,
      user: { id: identity.id, name: identity.name, email: identity.email, role },
      expiresIn: "8h",
    });
  }

  const demo = DEMO_USERS[email];
  if (!demo || demo.password !== password) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }
  const token = await signToken({ sub: demo.id, name: demo.name, email: demo.email, role: demo.role });
  return NextResponse.json({
    token,
    user: { id: demo.id, name: demo.name, email: demo.email, role: demo.role },
    expiresIn: "8h",
    mode: "demo",
  });
}
