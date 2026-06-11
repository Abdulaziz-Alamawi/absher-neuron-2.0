/**
 * Absher Neuron 2.0 — Deterministic intelligence dataset
 * Author: Abdulaziz AlAmawi
 *
 * Generates a realistic, stable corpus of identities, threats, incidents,
 * alerts, sessions, audit logs and time-series telemetry. Seeded so the
 * platform renders identically on server and client (no hydration drift).
 */

import { seeded, pick, clamp } from "@/lib/utils";
import {
  NAMES, DEPARTMENTS, CITIES, ISPS, CATEGORIES, THREAT_LABELS, MITRE,
  RECOMMENDED_ACTIONS, severityFromRisk,
} from "@/lib/data/catalog";
import type {
  ThreatEvent, SecurityAlert, Incident, ManagedUser, SessionRecord,
  AuditLog, MetricPoint, KpiSnapshot, GeoContext, Role, VerificationRecord,
  ResponseAction, IncidentEvent, AuthDecision, Severity,
} from "@/lib/types";

const EPOCH = Date.UTC(2026, 5, 11, 6, 0, 0); // stable reference instant

function isoMinutesAgo(min: number): string {
  return new Date(EPOCH - min * 60000).toISOString();
}

function ip(rng: () => number): string {
  return `${37 + Math.floor(rng() * 180)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`;
}

function geo(rng: () => number, forceAnomaly = false): GeoContext {
  const pool = forceAnomaly ? CITIES.filter((c) => !c.expected) : CITIES;
  const c = pick(rng, pool);
  return {
    country: c.country, countryCode: c.cc, city: c.city,
    lat: c.lat, lng: c.lng, expectedRegion: c.expected,
  };
}

function decisionFromRisk(risk: number): AuthDecision {
  if (risk >= 80) return "block";
  if (risk >= 55) return "challenge";
  if (risk >= 32) return "step_up";
  return "allow";
}

export function generateThreats(count = 60): ThreatEvent[] {
  const rng = seeded(1337);
  const out: ThreatEvent[] = [];
  for (let i = 0; i < count; i++) {
    const cat = pick(rng, CATEGORIES);
    const anomalous = rng() > 0.45;
    const g = geo(rng, anomalous);
    const risk = clamp(
      (anomalous ? 55 : 15) + rng() * 45 + (cat === "account_takeover" || cat === "identity_fraud" ? 15 : 0),
    );
    const nameIdx = Math.floor(rng() * NAMES.length);
    out.push({
      id: `thr_${(10000 + i).toString(36)}`,
      timestamp: isoMinutesAgo(Math.floor(rng() * 1440)),
      category: cat,
      severity: severityFromRisk(risk),
      userId: `usr_${1000 + nameIdx}`,
      userName: NAMES[nameIdx],
      sourceIp: ip(rng),
      geo: g,
      riskScore: Math.round(risk),
      confidence: Math.round(70 + rng() * 29),
      decision: decisionFromRisk(risk),
      description: `${THREAT_LABELS[cat]} detected from ${g.city}, ${g.country}.`,
      mitre: MITRE[cat],
      status: rng() > 0.6 ? "mitigated" : rng() > 0.3 ? "monitoring" : "active",
    });
  }
  return out.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

export function generateAlerts(count = 24): SecurityAlert[] {
  const rng = seeded(424242);
  const statuses: SecurityAlert["status"][] = ["new", "acknowledged", "in_progress", "resolved", "dismissed"];
  const out: SecurityAlert[] = [];
  for (let i = 0; i < count; i++) {
    const cat = pick(rng, CATEGORIES);
    const risk = clamp(25 + rng() * 74);
    const nameIdx = Math.floor(rng() * NAMES.length);
    out.push({
      id: `alt_${(20000 + i).toString(36)}`,
      createdAt: isoMinutesAgo(Math.floor(rng() * 720)),
      severity: severityFromRisk(risk),
      title: THREAT_LABELS[cat],
      category: cat,
      userId: `usr_${1000 + nameIdx}`,
      userName: NAMES[nameIdx],
      aiConfidence: Math.round(72 + rng() * 27),
      explanation: explain(cat, risk),
      recommendedActions: RECOMMENDED_ACTIONS[cat],
      status: i < 6 ? "new" : pick(rng, statuses),
      riskScore: Math.round(risk),
    });
  }
  return out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

function explain(cat: keyof typeof THREAT_LABELS, risk: number): string {
  const base: Record<string, string> = {
    account_takeover: "Behavioral biometrics deviate >3σ from baseline while accessing high-value identity operations.",
    credential_theft: "Credentials replayed from a host previously associated with infostealer infrastructure.",
    suspicious_login: "Sign-in combines an unrecognized device with off-hours access and a low-reputation network.",
    bot_activity: "Pointer entropy near zero and superhuman form-fill cadence indicate scripted automation.",
    identity_fraud: "Liveness signals and document binding diverge from the enrolled identity template.",
    location_anomaly: "Login geography is inconsistent with the 90-day movement model for this identity.",
    device_anomaly: "Device fingerprint mismatch on canvas + WebGL + audio entropy vectors.",
    session_hijack: "Mid-session token reused from a second IP/ASN with a different fingerprint.",
    impossible_travel: "Two authentications 1,900 km apart within 14 minutes — physically impossible.",
    brute_force: "Velocity of failed attempts exceeds adaptive lockout threshold for the identity.",
  };
  return `${base[cat]} Composite risk ${Math.round(risk)}/100.`;
}

export function generateUsers(count = 28): ManagedUser[] {
  const rng = seeded(98765);
  const roles: Role[] = ["analyst", "responder", "admin", "auditor", "superadmin"];
  const out: ManagedUser[] = [];
  for (let i = 0; i < count; i++) {
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : "");
    const risk = clamp(rng() * 100);
    const trust = clamp(100 - risk * (0.5 + rng() * 0.4));
    out.push({
      id: `usr_${1000 + i}`,
      name,
      nationalIdMasked: `1${Math.floor(rng() * 9)}••••••${Math.floor(1000 + rng() * 8999)}`,
      email: name.toLowerCase().replace(/[^a-z]/g, ".") + "@absher.sa",
      role: i === 0 ? "superadmin" : pick(rng, roles),
      department: pick(rng, DEPARTMENTS),
      trustScore: Math.round(trust),
      riskScore: Math.round(risk),
      status: risk > 82 ? "locked" : risk > 65 ? "monitoring" : rng() > 0.95 ? "suspended" : "active",
      mfaEnabled: rng() > 0.15,
      lastLogin: isoMinutesAgo(Math.floor(rng() * 4320)),
      devices: 1 + Math.floor(rng() * 5),
      flags: Math.floor(risk / 25),
    });
  }
  return out;
}

export function generateSessions(count = 18): SessionRecord[] {
  const rng = seeded(555111);
  const devices = ["iPhone 15 Pro", "MacBook Pro", "Galaxy S24", "Windows 11 PC", "iPad Air", "Pixel 8"];
  const out: SessionRecord[] = [];
  for (let i = 0; i < count; i++) {
    const g = geo(rng, rng() > 0.7);
    const risk = clamp((g.expectedRegion ? 10 : 50) + rng() * 50);
    const nameIdx = Math.floor(rng() * NAMES.length);
    out.push({
      id: `ses_${(30000 + i).toString(36)}`,
      userId: `usr_${1000 + nameIdx}`,
      userName: NAMES[nameIdx],
      startedAt: isoMinutesAgo(Math.floor(rng() * 240)),
      device: pick(rng, devices),
      location: `${g.city}, ${g.countryCode}`,
      ip: ip(rng),
      riskScore: Math.round(risk),
      decision: decisionFromRisk(risk),
      active: rng() > 0.25,
    });
  }
  return out.sort((a, b) => b.riskScore - a.riskScore);
}

export function generateIncidents(count = 9): Incident[] {
  const rng = seeded(70707);
  const statuses: Incident["status"][] = ["open", "investigating", "contained", "resolved", "closed"];
  const responders = ["Abdulaziz AlAmawi", "SOC Tier-2", "Fraud Response", "Identity Trust Team"];
  const out: Incident[] = [];
  for (let i = 0; i < count; i++) {
    const cat = pick(rng, CATEGORIES);
    const risk = clamp(45 + rng() * 54);
    const openedMin = 30 + Math.floor(rng() * 5760);
    const timeline: IncidentEvent[] = [
      { at: isoMinutesAgo(openedMin), actor: "Neuron Engine", action: "Detection", detail: `${THREAT_LABELS[cat]} flagged by anomaly model (risk ${Math.round(risk)}).` },
      { at: isoMinutesAgo(openedMin - 12), actor: "Auto-Response", action: "Containment", detail: "Adaptive MFA enforced and high-risk sessions revoked." },
      { at: isoMinutesAgo(openedMin - 40), actor: pick(rng, responders), action: "Triage", detail: "Analyst confirmed indicators and scoped blast radius." },
    ];
    const responseActions: ResponseAction[] = [
      { id: `ra_${i}_1`, label: "Block source IP range", type: "block_ip", automated: true, executed: true },
      { id: `ra_${i}_2`, label: "Force MFA re-enrollment", type: "force_mfa", automated: true, executed: rng() > 0.4 },
      { id: `ra_${i}_3`, label: "Lock affected accounts", type: "lock_account", automated: false, executed: rng() > 0.6 },
      { id: `ra_${i}_4`, label: "Revoke active sessions", type: "revoke_session", automated: true, executed: rng() > 0.3 },
    ];
    out.push({
      id: `inc_${(40000 + i).toString(36)}`,
      title: `${THREAT_LABELS[cat]} — Identity Cluster ${String.fromCharCode(65 + i)}`,
      status: i < 2 ? "investigating" : pick(rng, statuses),
      severity: severityFromRisk(risk),
      category: cat,
      openedAt: isoMinutesAgo(openedMin),
      updatedAt: isoMinutesAgo(Math.floor(rng() * 60)),
      assignee: pick(rng, responders),
      affectedUsers: 1 + Math.floor(rng() * 40),
      riskScore: Math.round(risk),
      summary: explain(cat, risk),
      timeline,
      responseActions,
    });
  }
  return out;
}

export function generateAuditLogs(count = 40): AuditLog[] {
  const rng = seeded(31415);
  const roles: Role[] = ["analyst", "responder", "admin", "auditor", "superadmin"];
  const actions = [
    ["Viewed identity profile", "usr_1004", "success"], ["Forced MFA challenge", "usr_1012", "success"],
    ["Locked account", "usr_1019", "success"], ["Exported audit report", "compliance/q2", "success"],
    ["Modified security policy", "policy/geo-fence", "success"], ["Revoked session", "ses_30007", "success"],
    ["Attempted privilege escalation", "rbac/superadmin", "denied"], ["Blocked IP range", "185.220.0.0/16", "success"],
    ["Reviewed incident", "inc_40001", "success"], ["Updated trusted device", "dev_9a21", "success"],
  ];
  const out: AuditLog[] = [];
  for (let i = 0; i < count; i++) {
    const a = pick(rng, actions);
    const nameIdx = Math.floor(rng() * NAMES.length);
    out.push({
      id: `aud_${(50000 + i).toString(36)}`,
      at: isoMinutesAgo(Math.floor(rng() * 2880)),
      actor: NAMES[nameIdx],
      role: pick(rng, roles),
      action: a[0],
      target: a[1],
      outcome: a[2] as AuditLog["outcome"],
      ip: ip(rng),
    });
  }
  return out.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

export function generateVerifications(count = 16): VerificationRecord[] {
  const rng = seeded(60606);
  const methods: VerificationRecord["method"][] = ["otp", "face", "live_camera", "voice", "phone_call"];
  const out: VerificationRecord[] = [];
  for (let i = 0; i < count; i++) {
    const score = Math.round(40 + rng() * 60);
    out.push({
      id: `ver_${(60000 + i).toString(36)}`,
      at: isoMinutesAgo(Math.floor(rng() * 1440)),
      method: pick(rng, methods),
      status: score > 70 ? "passed" : score > 50 ? "pending" : "failed",
      score,
      userId: `usr_${1000 + Math.floor(rng() * NAMES.length)}`,
    });
  }
  return out.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

export function timeSeries(seed: number, points: number, base: number, amp: number, trend = 0): MetricPoint[] {
  const rng = seeded(seed);
  const out: MetricPoint[] = [];
  for (let i = 0; i < points; i++) {
    const wave = Math.sin((i / points) * Math.PI * 4) * amp * 0.4;
    const noise = (rng() - 0.5) * amp;
    out.push({
      t: isoMinutesAgo((points - i) * 60),
      v: Math.max(0, Math.round(base + wave + noise + trend * i)),
    });
  }
  return out;
}

export function generateKpis(): KpiSnapshot {
  return {
    identitiesProtected: 4218734,
    threatsBlockedToday: 1342,
    activeIncidents: 7,
    avgTrustScore: 86,
    meanTimeToDetectSec: 38,
    meanTimeToRespondSec: 214,
    modelAccuracy: 97.4,
    liveSessions: 2841,
  };
}

/** Severity distribution for the current threat corpus. */
export function severityDistribution(threats: ThreatEvent[]): Record<Severity, number> {
  const dist: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const t of threats) dist[t.severity]++;
  return dist;
}

/** Geographic risk aggregation for the heatmap / globe. */
export function geoAggregate(threats: ThreatEvent[]) {
  const map = new Map<string, { country: string; cc: string; lat: number; lng: number; count: number; risk: number }>();
  for (const t of threats) {
    const key = t.geo.countryCode;
    const cur = map.get(key) || { country: t.geo.country, cc: key, lat: t.geo.lat, lng: t.geo.lng, count: 0, risk: 0 };
    cur.count++;
    cur.risk = Math.max(cur.risk, t.riskScore);
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
