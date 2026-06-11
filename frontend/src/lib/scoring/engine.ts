/**
 * Absher Neuron 2.0 — Behavioral Risk Scoring Engine
 * Author: Abdulaziz AlAmawi
 *
 * A transparent, explainable risk engine that fuses behavioral biometrics,
 * device/network/geo context and a baseline behavioral profile into a
 * Trust Score, Risk Score and Confidence Score, then maps risk to a
 * risk-based authentication decision (Adaptive MFA).
 *
 * The heavy ML (Isolation Forest / Random Forest / XGBoost) lives in the
 * Python AI engine. This module is the deterministic, auditable scoring
 * layer the gateway uses inline and as a fallback when the AI engine is
 * offline — every score ships with a full breakdown for explainability.
 */

import type {
  BehavioralSignals,
  BehavioralProfile,
  DeviceFingerprint,
  NetworkContext,
  GeoContext,
  RiskAssessment,
  ScoreBreakdown,
  VerificationMethod,
  AuthDecision,
} from "@/lib/types";
import { clamp } from "@/lib/utils";

export interface ScoringContext {
  signals: BehavioralSignals;
  profile: BehavioralProfile;
  device: DeviceFingerprint;
  network: NetworkContext;
  geo: GeoContext;
  hourOfDay: number;
  failedAttempts: number;
}

const MODEL_VERSION = "neuron-rba-2.0.3";

/** Gaussian-ish deviation score: 0 (on baseline) .. 100 (far off). */
function deviation(value: number, baseline: number, tolerance: number): number {
  if (baseline <= 0) return 0;
  const delta = Math.abs(value - baseline) / Math.max(tolerance, baseline * 0.15);
  return clamp(delta * 45, 0, 100);
}

/**
 * Isolation-Forest-style anomaly approximation: the more a sample sits in
 * sparse regions of the behavioral feature space, the higher the path-length
 * anomaly. Returns -1 (anomalous) .. 1 (normal) to mirror sklearn semantics.
 */
function anomalyScore(ctx: ScoringContext): number {
  const features = [
    deviation(ctx.signals.typingSpeedCpm, ctx.profile.baselineTypingCpm, 60),
    deviation(ctx.signals.mouseVelocity, ctx.profile.baselineMouseVelocity, 250),
    ctx.signals.typingRhythmVariance * 100,
    ctx.signals.mouseJitter * 100,
    ctx.network.vpnDetected ? 70 : 0,
    ctx.network.torDetected ? 95 : 0,
    100 - ctx.network.ipReputation,
    ctx.geo.expectedRegion ? 0 : 80,
  ];
  const mean = features.reduce((a, b) => a + b, 0) / features.length;
  // Normalize mean deviation to [-1, 1]; high deviation -> negative (anomalous)
  return clamp(1 - mean / 55, -1, 1);
}

export function assessRisk(ctx: ScoringContext): RiskAssessment {
  const breakdown: ScoreBreakdown[] = [];
  const reasons: string[] = [];

  const add = (
    label: string,
    weight: number,
    value: number,
    detail: string,
  ) => {
    const contribution = (value * weight) / 100;
    breakdown.push({ label, weight, value: Math.round(value), contribution, detail });
    return contribution;
  };

  // 1. Typing biometrics
  const typingDev = deviation(ctx.signals.typingSpeedCpm, ctx.profile.baselineTypingCpm, 60);
  const rhythm = ctx.signals.typingRhythmVariance * 100;
  const typingRisk = clamp(typingDev * 0.6 + rhythm * 0.4);
  add("Typing biometrics", 16, typingRisk, `${Math.round(ctx.signals.typingSpeedCpm)} cpm vs baseline ${Math.round(ctx.profile.baselineTypingCpm)} cpm`);
  if (typingRisk > 60) reasons.push("Typing cadence diverges sharply from the learned baseline.");

  // 2. Mouse / pointer dynamics
  const mouseDev = deviation(ctx.signals.mouseVelocity, ctx.profile.baselineMouseVelocity, 250);
  const mouseRisk = clamp(mouseDev * 0.5 + ctx.signals.mouseJitter * 50 + (ctx.signals.mouseIdleRatio > 0.85 ? 30 : 0));
  add("Pointer dynamics", 12, mouseRisk, `velocity ${Math.round(ctx.signals.mouseVelocity)} px/s, jitter ${(ctx.signals.mouseJitter * 100).toFixed(0)}%`);
  if (ctx.signals.interactionCount < 3 && ctx.signals.mouseIdleRatio > 0.9) {
    reasons.push("Near-zero human interaction — possible automated/bot session.");
  }

  // 3. Device fingerprint
  const deviceRisk = ctx.device.trusted ? 8 : 72;
  add("Device fingerprint", 16, deviceRisk, ctx.device.trusted ? "Recognized trusted device" : `Unrecognized device (${ctx.device.browser} / ${ctx.device.os})`);
  if (!ctx.device.trusted) reasons.push("Sign-in from a device fingerprint never seen for this identity.");

  // 4. Network reputation
  let netRisk = 100 - ctx.network.ipReputation;
  if (ctx.network.torDetected) netRisk = Math.max(netRisk, 92);
  else if (ctx.network.proxyDetected) netRisk = Math.max(netRisk, 70);
  else if (ctx.network.vpnDetected) netRisk = Math.max(netRisk, 55);
  add("Network reputation", 14, clamp(netRisk), `${ctx.network.isp} • ${ctx.network.asn}${ctx.network.torDetected ? " • TOR" : ctx.network.vpnDetected ? " • VPN" : ""}`);
  if (ctx.network.torDetected) reasons.push("Connection originates from the TOR network.");
  else if (ctx.network.vpnDetected) reasons.push("Anonymizing VPN detected on the connection.");

  // 5. Geo / impossible travel
  const geoRisk = ctx.geo.expectedRegion ? 6 : 78;
  add("Geo context", 14, geoRisk, `${ctx.geo.city}, ${ctx.geo.country}${ctx.geo.expectedRegion ? "" : " (out of region)"}`);
  if (!ctx.geo.expectedRegion) reasons.push(`Login geography (${ctx.geo.country}) is inconsistent with the user's history.`);

  // 6. Temporal pattern
  const activeHour = ctx.profile.baselineActiveHours.includes(ctx.hourOfDay);
  const timeRisk = activeHour ? 5 : 48;
  add("Temporal pattern", 8, timeRisk, activeHour ? "Within normal active hours" : `Off-hours access (${ctx.hourOfDay}:00)`);

  // 7. Credential pressure (failed attempts / brute force)
  const credRisk = clamp(ctx.failedAttempts * 22);
  add("Credential pressure", 12, credRisk, `${ctx.failedAttempts} recent failed attempt(s)`);
  if (ctx.failedAttempts >= 3) reasons.push("Multiple failed credential attempts indicate brute-force pressure.");

  // 8. Anomaly model
  const anomaly = anomalyScore(ctx);
  const anomalyRisk = clamp((1 - (anomaly + 1) / 2) * 100);
  add("Anomaly model", 8, anomalyRisk, `Isolation-Forest score ${anomaly.toFixed(2)}`);

  const totalWeight = breakdown.reduce((a, b) => a + b.weight, 0);
  const riskScore = clamp(
    breakdown.reduce((a, b) => a + b.contribution, 0) * (100 / totalWeight),
  );

  // Confidence grows with profile maturity and interaction volume.
  const maturity = clamp((ctx.profile.samples / 80) * 100);
  const dataQuality = clamp((ctx.signals.interactionCount / 25) * 100);
  const confidenceScore = clamp(0.55 * ctx.profile.confidence + 0.25 * maturity + 0.2 * dataQuality);

  // Trust = inverse of risk, tempered by confidence and known-device boost.
  const trustBase = 100 - riskScore;
  const trustScore = clamp(trustBase * (0.7 + 0.3 * (confidenceScore / 100)) + (ctx.device.trusted ? 6 : 0));

  const decision = decide(riskScore, confidenceScore);
  const requiredVerification = verificationFor(decision, riskScore, reasons);

  if (reasons.length === 0) reasons.push("Behavioral, device and contextual signals align with the trusted baseline.");

  return {
    trustScore: Math.round(trustScore),
    riskScore: Math.round(riskScore),
    confidenceScore: Math.round(confidenceScore),
    decision,
    anomalyScore: Number(anomaly.toFixed(3)),
    requiredVerification,
    breakdown: breakdown.sort((a, b) => b.contribution - a.contribution),
    reasons,
    modelVersion: MODEL_VERSION,
    evaluatedAt: new Date().toISOString(),
  };
}

export function decide(risk: number, confidence: number): AuthDecision {
  // Low model confidence nudges toward stronger verification.
  const adj = risk + (confidence < 50 ? 10 : 0);
  if (adj >= 80) return "block";
  if (adj >= 55) return "challenge";
  if (adj >= 32) return "step_up";
  return "allow";
}

/** Risk-based authentication: higher risk demands stronger proofs. */
export function verificationFor(
  decision: AuthDecision,
  risk: number,
  reasons: string[],
): VerificationMethod[] {
  const m: VerificationMethod[] = [];
  if (decision === "allow") return m;
  if (decision === "step_up") {
    m.push("otp");
    return m;
  }
  if (decision === "challenge") {
    m.push("otp", "face");
    if (reasons.some((r) => r.toLowerCase().includes("device"))) m.push("phone_call");
    return m;
  }
  // block -> hardest proofs to recover the account
  m.push("otp", "live_camera", "voice", "phone_call");
  return m;
}

export const ENGINE_MODEL_VERSION = MODEL_VERSION;
