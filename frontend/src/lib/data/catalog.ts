/**
 * Absher Neuron 2.0 — Reference catalogs
 * Author: Abdulaziz AlAmawi
 */
import type { ThreatCategory, Severity } from "@/lib/types";

export const NAMES = [
  "Abdulaziz AlAmawi", "Sara AlQahtani", "Mohammed AlHarbi", "Noura AlOtaibi",
  "Khalid AlGhamdi", "Reem AlDosari", "Faisal AlShehri", "Lama AlZahrani",
  "Yousef AlMutairi", "Hessa AlSubaie", "Turki AlRashid", "Maha AlBalawi",
  "Omar AlJuhani", "Aisha AlAnzi", "Bandar AlShammari", "Latifa AlMalki",
  "Saud AlFaisal", "Ghada AlYami", "Nawaf AlHamad", "Dana AlSudairi",
];

export const DEPARTMENTS = [
  "National Identity", "Citizen Services", "Border Control", "Traffic",
  "Civil Affairs", "Passports", "Digital Wallet", "Government Relations",
];

export const CITIES: { city: string; country: string; cc: string; lat: number; lng: number; expected: boolean }[] = [
  { city: "Riyadh", country: "Saudi Arabia", cc: "SA", lat: 24.71, lng: 46.68, expected: true },
  { city: "Jeddah", country: "Saudi Arabia", cc: "SA", lat: 21.49, lng: 39.18, expected: true },
  { city: "Dammam", country: "Saudi Arabia", cc: "SA", lat: 26.42, lng: 50.09, expected: true },
  { city: "Mecca", country: "Saudi Arabia", cc: "SA", lat: 21.39, lng: 39.85, expected: true },
  { city: "Medina", country: "Saudi Arabia", cc: "SA", lat: 24.52, lng: 39.57, expected: true },
  { city: "Dubai", country: "UAE", cc: "AE", lat: 25.2, lng: 55.27, expected: false },
  { city: "Cairo", country: "Egypt", cc: "EG", lat: 30.04, lng: 31.24, expected: false },
  { city: "Istanbul", country: "Türkiye", cc: "TR", lat: 41.01, lng: 28.98, expected: false },
  { city: "Frankfurt", country: "Germany", cc: "DE", lat: 50.11, lng: 8.68, expected: false },
  { city: "Lagos", country: "Nigeria", cc: "NG", lat: 6.52, lng: 3.38, expected: false },
  { city: "Moscow", country: "Russia", cc: "RU", lat: 55.75, lng: 37.62, expected: false },
  { city: "Hong Kong", country: "China", cc: "CN", lat: 22.32, lng: 114.17, expected: false },
];

export const ISPS = [
  { isp: "STC", asn: "AS25019" }, { isp: "Mobily", asn: "AS35819" },
  { isp: "Zain SA", asn: "AS59605" }, { isp: "DigitalOcean", asn: "AS14061" },
  { isp: "OVH SAS", asn: "AS16276" }, { isp: "M247 Europe", asn: "AS9009" },
  { isp: "Hetzner", asn: "AS24940" },
];

export const THREAT_LABELS: Record<ThreatCategory, string> = {
  account_takeover: "Account Takeover Attempt",
  credential_theft: "Credential Theft",
  suspicious_login: "Suspicious Login",
  bot_activity: "Automated Bot Activity",
  identity_fraud: "Identity Fraud",
  location_anomaly: "Location Anomaly",
  device_anomaly: "Device Anomaly",
  session_hijack: "Session Hijacking",
  impossible_travel: "Impossible Travel",
  brute_force: "Brute-Force Attack",
};

export const MITRE: Record<ThreatCategory, string> = {
  account_takeover: "T1078",
  credential_theft: "T1555",
  suspicious_login: "T1078.004",
  bot_activity: "T1071",
  identity_fraud: "T1585",
  location_anomaly: "T1078.001",
  device_anomaly: "T1200",
  session_hijack: "T1563",
  impossible_travel: "T1078.004",
  brute_force: "T1110",
};

export const CATEGORIES = Object.keys(THREAT_LABELS) as ThreatCategory[];

export const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];

export function severityFromRisk(risk: number): Severity {
  if (risk >= 80) return "critical";
  if (risk >= 60) return "high";
  if (risk >= 40) return "medium";
  if (risk >= 20) return "low";
  return "info";
}

export const RECOMMENDED_ACTIONS: Record<ThreatCategory, string[]> = {
  account_takeover: ["Force adaptive MFA re-challenge", "Revoke all active sessions", "Notify identity owner via Absher app"],
  credential_theft: ["Rotate credentials", "Enforce passwordless re-enrollment", "Scan for credential reuse across services"],
  suspicious_login: ["Step-up verification (OTP + Face)", "Flag session for analyst review"],
  bot_activity: ["Apply bot challenge", "Rate-limit source ASN", "Block automation fingerprint"],
  identity_fraud: ["Trigger live-camera verification", "Escalate to fraud response team", "Freeze identity transactions"],
  location_anomaly: ["Geo-fence challenge", "Request voice verification", "Confirm travel via phone call"],
  device_anomaly: ["Quarantine device", "Require device re-enrollment", "Notify identity owner"],
  session_hijack: ["Terminate session", "Invalidate session tokens", "Force full re-authentication"],
  impossible_travel: ["Block session", "Live-camera + phone verification", "Open incident for investigation"],
  brute_force: ["Lock account temporarily", "Block source IP", "Enforce CAPTCHA + MFA"],
};
