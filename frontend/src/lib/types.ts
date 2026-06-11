/**
 * Absher Neuron 2.0 — Core domain model
 * Author: Abdulaziz AlAmawi
 *
 * Shared type definitions for the AI Security Intelligence Platform.
 */

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type ThreatCategory =
  | "account_takeover"
  | "credential_theft"
  | "suspicious_login"
  | "bot_activity"
  | "identity_fraud"
  | "location_anomaly"
  | "device_anomaly"
  | "session_hijack"
  | "impossible_travel"
  | "brute_force";

export type VerificationMethod =
  | "otp"
  | "face"
  | "live_camera"
  | "voice"
  | "phone_call";

export type VerificationStatus = "passed" | "failed" | "pending" | "skipped";

export type IncidentStatus =
  | "open"
  | "investigating"
  | "contained"
  | "resolved"
  | "closed";

export type AuthDecision = "allow" | "step_up" | "challenge" | "block";

export type Role = "analyst" | "responder" | "admin" | "auditor" | "superadmin";

/** Behavioral signal captured from the live session. */
export interface BehavioralSignals {
  typingSpeedCpm: number; // characters per minute
  typingRhythmVariance: number; // 0..1, lower = more consistent
  keyHoldMs: number; // average dwell time
  flightTimeMs: number; // average time between keystrokes
  mouseVelocity: number; // px/s
  mouseJitter: number; // 0..1
  mouseIdleRatio: number; // 0..1
  scrollEntropy: number; // 0..1
  touchPressure?: number;
  interactionCount: number;
}

export interface DeviceFingerprint {
  id: string;
  platform: string;
  browser: string;
  browserVersion: string;
  os: string;
  screen: string;
  timezone: string;
  language: string;
  cpuCores: number;
  deviceMemoryGb: number;
  gpu: string;
  canvasHash: string;
  webglHash: string;
  audioHash: string;
  touchSupport: boolean;
  trusted: boolean;
  firstSeen: string;
  lastSeen: string;
}

export interface NetworkContext {
  ip: string;
  asn: string;
  isp: string;
  connectionType: string;
  vpnDetected: boolean;
  torDetected: boolean;
  proxyDetected: boolean;
  ipReputation: number; // 0..100, higher = cleaner
}

export interface GeoContext {
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lng: number;
  expectedRegion: boolean;
}

export interface BehavioralProfile {
  userId: string;
  baselineTypingCpm: number;
  baselineMouseVelocity: number;
  baselineActiveHours: number[]; // 0..23
  knownDeviceIds: string[];
  knownLocations: string[];
  samples: number;
  confidence: number; // 0..100, model maturity
  lastUpdated: string;
}

export interface ScoreBreakdown {
  label: string;
  weight: number;
  value: number; // 0..100
  contribution: number; // signed
  detail: string;
}

export interface RiskAssessment {
  trustScore: number; // 0..100 higher = safer
  riskScore: number; // 0..100 higher = riskier
  confidenceScore: number; // 0..100 model confidence
  decision: AuthDecision;
  anomalyScore: number; // -1..1 isolation-forest style
  requiredVerification: VerificationMethod[];
  breakdown: ScoreBreakdown[];
  reasons: string[];
  modelVersion: string;
  evaluatedAt: string;
}

export interface ThreatEvent {
  id: string;
  timestamp: string;
  category: ThreatCategory;
  severity: Severity;
  userId: string;
  userName: string;
  sourceIp: string;
  geo: GeoContext;
  riskScore: number;
  confidence: number;
  decision: AuthDecision;
  description: string;
  mitre?: string; // MITRE ATT&CK technique id
  status: "active" | "mitigated" | "monitoring";
}

export interface SecurityAlert {
  id: string;
  createdAt: string;
  severity: Severity;
  title: string;
  category: ThreatCategory;
  userId: string;
  userName: string;
  aiConfidence: number;
  explanation: string;
  recommendedActions: string[];
  status: "new" | "acknowledged" | "in_progress" | "resolved" | "dismissed";
  riskScore: number;
}

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: Severity;
  category: ThreatCategory;
  openedAt: string;
  updatedAt: string;
  assignee: string;
  affectedUsers: number;
  riskScore: number;
  summary: string;
  timeline: IncidentEvent[];
  responseActions: ResponseAction[];
}

export interface IncidentEvent {
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export interface ResponseAction {
  id: string;
  label: string;
  type: "block_ip" | "lock_account" | "force_mfa" | "revoke_session" | "notify" | "quarantine_device";
  automated: boolean;
  executed: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  nationalIdMasked: string;
  email: string;
  role: Role;
  department: string;
  trustScore: number;
  riskScore: number;
  status: "active" | "locked" | "suspended" | "monitoring";
  mfaEnabled: boolean;
  lastLogin: string;
  devices: number;
  flags: number;
}

export interface SessionRecord {
  id: string;
  userId: string;
  userName: string;
  startedAt: string;
  device: string;
  location: string;
  ip: string;
  riskScore: number;
  decision: AuthDecision;
  active: boolean;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  role: Role;
  action: string;
  target: string;
  outcome: "success" | "denied" | "error";
  ip: string;
}

export interface VerificationRecord {
  id: string;
  at: string;
  method: VerificationMethod;
  status: VerificationStatus;
  score: number;
  userId: string;
}

export interface MetricPoint {
  t: string;
  v: number;
}

export interface KpiSnapshot {
  identitiesProtected: number;
  threatsBlockedToday: number;
  activeIncidents: number;
  avgTrustScore: number;
  meanTimeToDetectSec: number;
  meanTimeToRespondSec: number;
  modelAccuracy: number;
  liveSessions: number;
}
