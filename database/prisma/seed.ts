/**
 * Absher Neuron 2.0 — Database seed
 * Author: Abdulaziz AlAmawi
 *
 * Seeds a representative corpus of identities, devices, sessions, threats,
 * alerts, incidents and security policies for local development and demos.
 */
import { PrismaClient, Role, Severity, AuthDecision, IncidentStatus } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

const NAMES = [
  "Abdulaziz AlAmawi", "Sara AlQahtani", "Mohammed AlHarbi", "Noura AlOtaibi",
  "Khalid AlGhamdi", "Reem AlDosari", "Faisal AlShehri", "Lama AlZahrani",
  "Yousef AlMutairi", "Hessa AlSubaie", "Turki AlRashid", "Maha AlBalawi",
];
const DEPARTMENTS = ["National Identity", "Citizen Services", "Border Control", "Passports", "Digital Wallet"];
const CATEGORIES = ["account_takeover", "credential_theft", "suspicious_login", "bot_activity", "brute_force", "location_anomaly"];

function hash(v: string) {
  return createHash("sha256").update(v).digest("hex").slice(0, 24);
}
function pick<T>(a: T[]) {
  return a[Math.floor(Math.random() * a.length)];
}
function sev(risk: number): Severity {
  if (risk >= 80) return "CRITICAL";
  if (risk >= 60) return "HIGH";
  if (risk >= 40) return "MEDIUM";
  if (risk >= 20) return "LOW";
  return "INFO";
}
function decide(risk: number): AuthDecision {
  if (risk >= 80) return "BLOCK";
  if (risk >= 55) return "CHALLENGE";
  if (risk >= 32) return "STEP_UP";
  return "ALLOW";
}

async function main() {
  console.log("[Neuron] Resetting dataset…");
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.responseAction.deleteMany(),
    prisma.incidentEvent.deleteMany(),
    prisma.threatEvent.deleteMany(),
    prisma.securityAlert.deleteMany(),
    prisma.incident.deleteMany(),
    prisma.session.deleteMany(),
    prisma.device.deleteMany(),
    prisma.behavioralProfile.deleteMany(),
    prisma.identity.deleteMany(),
    prisma.securityPolicy.deleteMany(),
  ]);

  console.log("[Neuron] Seeding identities…");
  for (let i = 0; i < NAMES.length; i++) {
    const name = NAMES[i];
    const risk = Math.floor(Math.random() * 100);
    const role: Role = i === 0 ? "SUPERADMIN" : pick(["ANALYST", "RESPONDER", "ADMIN", "AUDITOR"] as Role[]);
    const identity = await prisma.identity.create({
      data: {
        nationalIdHash: hash(`nid-${i}`),
        name,
        email: i === 0 ? "abdulaziz@absher.sa" : name.toLowerCase().replace(/[^a-z]/g, ".") + "@absher.sa",
        role,
        department: pick(DEPARTMENTS),
        trustScore: Math.max(0, 100 - risk),
        riskScore: risk,
        status: risk > 82 ? "locked" : risk > 65 ? "monitoring" : "active",
        mfaEnabled: Math.random() > 0.1,
        lastLoginAt: new Date(Date.now() - Math.random() * 86400000),
        profile: {
          create: {
            activeHours: [8, 9, 10, 13, 14, 20, 21],
            knownLocations: ["Riyadh, SA", "Jeddah, SA"],
            samples: Math.floor(Math.random() * 90),
            confidence: 60 + Math.floor(Math.random() * 39),
          },
        },
        devices: {
          create: [
            { fingerprint: hash(`dev-${i}-a`), platform: "iPhone", os: "iOS 18", browser: "Safari", trusted: true },
            { fingerprint: hash(`dev-${i}-b`), platform: "Win32", os: "Windows 11", browser: "Edge", trusted: Math.random() > 0.5 },
          ],
        },
      },
    });

    const sRisk = Math.floor(Math.random() * 100);
    const session = await prisma.session.create({
      data: {
        identityId: identity.id,
        ip: `37.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.10`,
        asn: "AS25019", country: "Saudi Arabia", city: "Riyadh",
        riskScore: sRisk, trustScore: 100 - sRisk, decision: decide(sRisk),
        active: Math.random() > 0.4,
      },
    });

    if (risk > 45) {
      const cat = pick(CATEGORIES);
      await prisma.threatEvent.create({
        data: {
          identityId: identity.id, sessionId: session.id,
          category: cat, severity: sev(risk), riskScore: risk,
          confidence: 70 + Math.floor(Math.random() * 29), decision: decide(risk),
          mitreTechnique: "T1078", sourceIp: session.ip, country: "Saudi Arabia", city: "Riyadh",
          description: `${cat.replace(/_/g, " ")} detected for ${name}.`,
        },
      });
      await prisma.securityAlert.create({
        data: {
          identityId: identity.id, title: cat.replace(/_/g, " "), category: cat,
          severity: sev(risk), riskScore: risk, aiConfidence: 75 + Math.floor(Math.random() * 24),
          explanation: `Composite behavioral & contextual risk ${risk}/100 for ${name}.`,
          recommended: ["Force adaptive MFA", "Revoke active sessions", "Notify identity owner"],
        },
      });
    }
  }

  console.log("[Neuron] Seeding incidents…");
  for (let i = 0; i < 5; i++) {
    const risk = 55 + Math.floor(Math.random() * 44);
    const cat = pick(CATEGORIES);
    await prisma.incident.create({
      data: {
        title: `${cat.replace(/_/g, " ")} — Cluster ${String.fromCharCode(65 + i)}`,
        category: cat, severity: sev(risk),
        status: pick(["OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED"] as IncidentStatus[]),
        riskScore: risk, affectedUsers: 1 + Math.floor(Math.random() * 40),
        assignee: "Abdulaziz AlAmawi",
        summary: `Coordinated ${cat.replace(/_/g, " ")} campaign detected and contained by the Neuron engine.`,
        timeline: {
          create: [
            { actor: "Neuron Engine", action: "Detection", detail: "Anomaly model flagged correlated high-risk sessions." },
            { actor: "Auto-Response", action: "Containment", detail: "Adaptive MFA enforced; high-risk sessions revoked." },
          ],
        },
        actions: {
          create: [
            { label: "Block source IP range", type: "block_ip", automated: true, executed: true, executedAt: new Date() },
            { label: "Force MFA re-enrollment", type: "force_mfa", automated: true, executed: Math.random() > 0.5 },
          ],
        },
      },
    });
  }

  console.log("[Neuron] Seeding security policies…");
  const policies = [
    { key: "rba", label: "Risk-Based Authentication", category: "auth", enabled: true },
    { key: "geo_fence", label: "Impossible-Travel Geo-Fencing", category: "auth", enabled: true },
    { key: "iforest", label: "Isolation Forest Anomaly Detection", category: "ai", enabled: true },
    { key: "rf", label: "Random Forest Threat Classifier", category: "ai", enabled: true },
    { key: "block_tor", label: "Block TOR Exit Nodes", category: "network", enabled: true },
  ];
  for (const p of policies) await prisma.securityPolicy.create({ data: p });

  console.log("[Neuron] Seeding audit trail…");
  let prev = "genesis";
  for (let i = 0; i < 20; i++) {
    const action = pick(["Viewed identity profile", "Forced MFA challenge", "Locked account", "Reviewed incident", "Exported audit report"]);
    const payload = `${action}-${i}-${prev}`;
    const h = hash(payload);
    await prisma.auditLog.create({
      data: {
        actor: pick(NAMES), role: pick(["ANALYST", "ADMIN", "SUPERADMIN"] as Role[]),
        action, target: `usr_${1000 + i}`, outcome: Math.random() > 0.1 ? "success" : "denied",
        ip: `37.0.0.${i}`, hash: h, prevHash: prev,
      },
    });
    prev = h;
  }

  console.log("[Neuron] Seed complete ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
