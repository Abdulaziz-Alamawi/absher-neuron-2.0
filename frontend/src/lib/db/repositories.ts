/**
 * Absher Neuron 2.0 — Data access layer (Prisma + generator fallback)
 * Author: Abdulaziz AlAmawi
 */
import { prisma, isDatabaseReady } from "@/lib/db/prisma";
import {
  mapThreat, mapAlert, mapIncident, mapUser, mapSession, mapAudit, mapVerification,
} from "@/lib/db/mappers";
import {
  generateThreats, generateAlerts, generateIncidents, generateUsers,
  generateSessions, generateAuditLogs, generateVerifications, severityDistribution, geoAggregate,
} from "@/lib/data/generate";
import type { Severity } from "@/lib/types";
import type { Severity as DbSeverity } from "@prisma/client";

const SEV_MAP: Record<string, DbSeverity> = {
  critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW", info: "INFO",
};

export async function getThreats(opts: { limit?: number; severity?: string; category?: string }) {
  const limit = opts.limit ?? 60;
  if (await isDatabaseReady()) {
    const rows = await prisma.threatEvent.findMany({
      where: {
        ...(opts.severity ? { severity: SEV_MAP[opts.severity] } : {}),
        ...(opts.category ? { category: opts.category } : {}),
      },
      include: { identity: true },
      orderBy: { detectedAt: "desc" },
      take: limit,
    });
    const threats = rows.map(mapThreat);
    return { source: "database" as const, threats, distribution: severityDistribution(threats), geo: geoAggregate(threats) };
  }
  let threats = generateThreats(limit);
  if (opts.severity) threats = threats.filter((t) => t.severity === opts.severity);
  if (opts.category) threats = threats.filter((t) => t.category === opts.category);
  return { source: "generator" as const, threats, distribution: severityDistribution(threats), geo: geoAggregate(threats) };
}

export async function getAlerts(opts: { limit?: number; severity?: string }) {
  const limit = opts.limit ?? 24;
  if (await isDatabaseReady()) {
    const rows = await prisma.securityAlert.findMany({
      where: opts.severity ? { severity: SEV_MAP[opts.severity] } : undefined,
      include: { identity: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return { source: "database" as const, alerts: rows.map(mapAlert) };
  }
  let alerts = generateAlerts(limit);
  if (opts.severity) alerts = alerts.filter((a) => a.severity === opts.severity);
  return { source: "generator" as const, alerts };
}

export async function getIncidents(limit = 9) {
  if (await isDatabaseReady()) {
    const rows = await prisma.incident.findMany({
      include: { timeline: { orderBy: { at: "desc" } }, actions: true },
      orderBy: { openedAt: "desc" },
      take: limit,
    });
    return { source: "database" as const, incidents: rows.map(mapIncident) };
  }
  return { source: "generator" as const, incidents: generateIncidents(limit) };
}

export async function getIdentities(limit = 28) {
  if (await isDatabaseReady()) {
    const rows = await prisma.identity.findMany({
      include: { devices: true },
      orderBy: { riskScore: "desc" },
      take: limit,
    });
    return { source: "database" as const, users: rows.map(mapUser) };
  }
  return { source: "generator" as const, users: generateUsers(limit) };
}

export async function getSessions(limit = 18) {
  if (await isDatabaseReady()) {
    const rows = await prisma.session.findMany({
      include: { identity: true, device: true },
      orderBy: { riskScore: "desc" },
      take: limit,
    });
    return { source: "database" as const, sessions: rows.map(mapSession) };
  }
  return { source: "generator" as const, sessions: generateSessions(limit) };
}

export async function getAuditLogs(limit = 40) {
  if (await isDatabaseReady()) {
    const rows = await prisma.auditLog.findMany({ orderBy: { at: "desc" }, take: limit });
    return { source: "database" as const, logs: rows.map(mapAudit) };
  }
  return { source: "generator" as const, logs: generateAuditLogs(limit) };
}

export async function getVerifications(limit = 16) {
  if (await isDatabaseReady()) {
    const rows = await prisma.verification.findMany({ orderBy: { at: "desc" }, take: limit });
    return { source: "database" as const, verifications: rows.map(mapVerification) };
  }
  return { source: "generator" as const, verifications: generateVerifications(limit) };
}

export async function getPolicies() {
  if (await isDatabaseReady()) {
    const rows = await prisma.securityPolicy.findMany({ orderBy: { category: "asc" } });
    return { source: "database" as const, policies: rows };
  }
  return {
    source: "generator" as const,
    policies: [
      { key: "rba", label: "Risk-Based Authentication", category: "auth", enabled: true },
      { key: "iforest", label: "Isolation Forest", category: "ai", enabled: true },
      { key: "block_tor", label: "Block TOR", category: "network", enabled: true },
    ],
  };
}

export async function getKpisFromDb() {
  if (!(await isDatabaseReady())) return null;
  const [identities, threats, incidents, sessions] = await Promise.all([
    prisma.identity.count(),
    prisma.threatEvent.count({ where: { detectedAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.incident.count({ where: { status: { in: ["OPEN", "INVESTIGATING", "CONTAINED"] } } }),
    prisma.session.count({ where: { active: true } }),
  ]);
  const avg = await prisma.identity.aggregate({ _avg: { trustScore: true } });
  return {
    identitiesProtected: identities,
    threatsBlockedToday: threats,
    activeIncidents: incidents,
    avgTrustScore: Math.round(avg._avg.trustScore ?? 80),
    liveSessions: sessions,
  };
}
