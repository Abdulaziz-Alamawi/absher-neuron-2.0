/**
 * Absher Neuron 2.0 — Live event simulator
 * Author: Abdulaziz AlAmawi
 *
 * Generates a realistic stream of threat events when the AI engine
 * WebSocket gateway is offline, so the command center is always live.
 */
import type { ThreatEvent, SecurityAlert } from "@/lib/types";
import { CATEGORIES, THREAT_LABELS, MITRE, CITIES, ISPS, NAMES, RECOMMENDED_ACTIONS, severityFromRisk } from "@/lib/data/catalog";

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function syntheticEvent(): ThreatEvent {
  const cat = rand(CATEGORIES);
  const c = rand(CITIES);
  const anomalous = !c.expected || Math.random() > 0.55;
  const risk = Math.min(100, Math.round((anomalous ? 50 : 12) + Math.random() * 48));
  const name = rand(NAMES);
  return {
    id: `thr_live_${Date.now().toString(36)}_${Math.floor(Math.random() * 999)}`,
    timestamp: new Date().toISOString(),
    category: cat,
    severity: severityFromRisk(risk),
    userId: `usr_${1000 + NAMES.indexOf(name)}`,
    userName: name,
    sourceIp: `${37 + Math.floor(Math.random() * 180)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    geo: { country: c.country, countryCode: c.cc, city: c.city, lat: c.lat, lng: c.lng, expectedRegion: c.expected },
    riskScore: risk,
    confidence: 70 + Math.floor(Math.random() * 29),
    decision: risk >= 80 ? "block" : risk >= 55 ? "challenge" : risk >= 32 ? "step_up" : "allow",
    description: `${THREAT_LABELS[cat]} detected from ${c.city}, ${c.country}.`,
    mitre: MITRE[cat],
    status: "active",
  };
}

export function eventToAlert(e: ThreatEvent): SecurityAlert {
  return {
    id: `alt_live_${e.id}`,
    createdAt: e.timestamp,
    severity: e.severity,
    title: THREAT_LABELS[e.category],
    category: e.category,
    userId: e.userId,
    userName: e.userName,
    aiConfidence: e.confidence,
    explanation: `${e.description} Composite risk ${e.riskScore}/100, decision: ${e.decision}.`,
    recommendedActions: RECOMMENDED_ACTIONS[e.category],
    status: "new",
    riskScore: e.riskScore,
  };
}

void ISPS;
