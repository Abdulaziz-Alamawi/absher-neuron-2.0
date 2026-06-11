/**
 * Absher Neuron 2.0 — API auth guard
 * Author: Abdulaziz AlAmawi
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, canPerform } from "@/lib/auth/jwt";
import type { Role } from "@/lib/types";

export async function requireAuth(req: NextRequest, action?: string) {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized — Bearer token required." }, { status: 401 }) };
  }
  const user = await verifyToken(token);
  if (!user) {
    return { error: NextResponse.json({ error: "Invalid or expired token." }, { status: 401 }) };
  }
  if (action && !canPerform(user.role, action)) {
    return { error: NextResponse.json({ error: "Forbidden — insufficient role." }, { status: 403 }) };
  }
  return { user };
}

export function authHeaders(role: Role) {
  return { "X-Neuron-Role": role };
}
