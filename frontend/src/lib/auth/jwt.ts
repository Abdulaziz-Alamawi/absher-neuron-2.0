/**
 * Absher Neuron 2.0 — JWT auth utilities
 * Author: Abdulaziz AlAmawi
 */
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/types";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "absher-neuron-dev-secret-abdulaziz-alamawi-2026",
);
const ISSUER = "absher-neuron";
const EXPIRY = "8h";

export interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ name: payload.name, email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: ISSUER });
    return {
      sub: payload.sub ?? "",
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/** RBAC permission check for mutating API operations. */
const PERMISSIONS: Record<string, Role[]> = {
  "lock_account": ["responder", "admin", "superadmin"],
  "resolve_alert": ["analyst", "responder", "admin", "superadmin"],
  "manage_policies": ["admin", "superadmin"],
  "export_audit": ["auditor", "admin", "superadmin"],
};

export function canPerform(role: Role, action: string): boolean {
  const allowed = PERMISSIONS[action];
  if (!allowed) return true;
  return allowed.includes(role);
}
