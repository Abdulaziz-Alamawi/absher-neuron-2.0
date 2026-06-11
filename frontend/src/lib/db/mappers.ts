/**
 * Absher Neuron 2.0 — Prisma ↔ domain mappers
 * Author: Abdulaziz AlAmawi
 */
import type {
  ThreatEvent, SecurityAlert, Incident, ManagedUser, SessionRecord,
  AuditLog, VerificationRecord, Severity, AuthDecision, Role, ThreatCategory,
  IncidentStatus, VerificationMethod, VerificationStatus,
} from "@/lib/types";
import type {
  ThreatEvent as DbThreat,
  SecurityAlert as DbAlert,
  Incident as DbIncident,
  Identity,
  Session,
  AuditLog as DbAudit,
  Verification,
  Severity as DbSeverity,
  AuthDecision as DbDecision,
  Role as DbRole,
  IncidentStatus as DbIncidentStatus,
  VerificationMethod as DbMethod,
  VerificationStatus as DbVerStatus,
} from "@prisma/client";

const SEV: Record<DbSeverity, Severity> = {
  CRITICAL: "critical", HIGH: "high", MEDIUM: "medium", LOW: "low", INFO: "info",
};
const DEC: Record<DbDecision, AuthDecision> = {
  ALLOW: "allow", STEP_UP: "step_up", CHALLENGE: "challenge", BLOCK: "block",
};
const ROLE: Record<DbRole, Role> = {
  ANALYST: "analyst", RESPONDER: "responder", ADMIN: "admin",
  AUDITOR: "auditor", SUPERADMIN: "superadmin",
};
const INC: Record<DbIncidentStatus, IncidentStatus> = {
  OPEN: "open", INVESTIGATING: "investigating", CONTAINED: "contained",
  RESOLVED: "resolved", CLOSED: "closed",
};
const VM: Record<DbMethod, VerificationMethod> = {
  OTP: "otp", FACE: "face", LIVE_CAMERA: "live_camera", VOICE: "voice", PHONE_CALL: "phone_call",
};
const VS: Record<DbVerStatus, VerificationStatus> = {
  PASSED: "passed", FAILED: "failed", PENDING: "pending", SKIPPED: "skipped",
};

export function mapThreat(t: DbThreat & { identity?: Identity | null }): ThreatEvent {
  return {
    id: t.id,
    timestamp: t.detectedAt.toISOString(),
    category: t.category as ThreatCategory,
    severity: SEV[t.severity],
    userId: t.identityId ?? "unknown",
    userName: t.identity?.name ?? "Unknown",
    sourceIp: t.sourceIp,
    geo: {
      country: t.country ?? "Unknown",
      countryCode: (t.country ?? "XX").slice(0, 2).toUpperCase(),
      city: t.city ?? "Unknown",
      lat: 0, lng: 0,
      expectedRegion: true,
    },
    riskScore: t.riskScore,
    confidence: t.confidence,
    decision: DEC[t.decision],
    description: t.description,
    mitre: t.mitreTechnique ?? undefined,
    status: t.status as ThreatEvent["status"],
  };
}

export function mapAlert(a: DbAlert & { identity?: Identity | null }): SecurityAlert {
  return {
    id: a.id,
    createdAt: a.createdAt.toISOString(),
    severity: SEV[a.severity],
    title: a.title,
    category: a.category as ThreatCategory,
    userId: a.identityId ?? "unknown",
    userName: a.identity?.name ?? "Unknown",
    aiConfidence: a.aiConfidence,
    explanation: a.explanation,
    recommendedActions: a.recommended,
    status: a.status as SecurityAlert["status"],
    riskScore: a.riskScore,
  };
}

export function mapIncident(
  i: DbIncident & {
    timeline?: { at: Date; actor: string; action: string; detail: string }[];
    actions?: { id: string; label: string; type: string; automated: boolean; executed: boolean }[];
  },
): Incident {
  return {
    id: i.id,
    title: i.title,
    status: INC[i.status],
    severity: SEV[i.severity],
    category: i.category as ThreatCategory,
    openedAt: i.openedAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
    assignee: i.assignee ?? "Unassigned",
    affectedUsers: i.affectedUsers,
    riskScore: i.riskScore,
    summary: i.summary,
    timeline: (i.timeline ?? []).map((e) => ({
      at: e.at.toISOString(), actor: e.actor, action: e.action, detail: e.detail,
    })),
    responseActions: (i.actions ?? []).map((a) => ({
      id: a.id, label: a.label, type: a.type as Incident["responseActions"][0]["type"],
      automated: a.automated, executed: a.executed,
    })),
  };
}

export function mapUser(u: Identity & { devices?: { id: string }[] }): ManagedUser {
  return {
    id: u.id,
    name: u.name,
    nationalIdMasked: u.nationalIdHash.slice(0, 2) + "••••••" + u.nationalIdHash.slice(-4),
    email: u.email,
    role: ROLE[u.role],
    department: u.department ?? "—",
    trustScore: u.trustScore,
    riskScore: u.riskScore,
    status: u.status as ManagedUser["status"],
    mfaEnabled: u.mfaEnabled,
    lastLogin: u.lastLoginAt?.toISOString() ?? new Date().toISOString(),
    devices: u.devices?.length ?? 0,
    flags: Math.floor(u.riskScore / 25),
  };
}

export function mapSession(s: Session & { identity?: Identity | null; device?: { platform?: string | null; browser?: string | null } | null }): SessionRecord {
  return {
    id: s.id,
    userId: s.identityId,
    userName: s.identity?.name ?? "Unknown",
    startedAt: s.startedAt.toISOString(),
    device: s.device ? `${s.device.platform ?? ""} ${s.device.browser ?? ""}`.trim() || "Unknown" : "Unknown",
    location: `${s.city ?? "?"}, ${s.country ?? "?"}`,
    ip: s.ip,
    riskScore: s.riskScore,
    decision: DEC[s.decision],
    active: s.active,
  };
}

export function mapAudit(l: DbAudit): AuditLog {
  return {
    id: l.id,
    at: l.at.toISOString(),
    actor: l.actor,
    role: ROLE[l.role],
    action: l.action,
    target: l.target,
    outcome: l.outcome as AuditLog["outcome"],
    ip: l.ip,
  };
}

export function mapVerification(v: Verification): VerificationRecord {
  return {
    id: v.id,
    at: v.at.toISOString(),
    method: VM[v.method],
    status: VS[v.status],
    score: v.score,
    userId: v.identityId,
  };
}
