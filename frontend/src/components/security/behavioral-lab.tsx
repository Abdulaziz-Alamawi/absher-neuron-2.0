"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { ScoreRing } from "@/components/charts/score-ring";
import { RadarChart } from "@/components/charts/radar";
import { Badge } from "@/components/ui/badge";
import { KeystrokeCollector, PointerCollector, buildSignals, collectFingerprint } from "@/lib/scoring/capture";
import { assessRisk, type ScoringContext } from "@/lib/scoring/engine";
import type { RiskAssessment, DeviceFingerprint, BehavioralProfile } from "@/lib/types";
import { trustColor, scoreColor, cn } from "@/lib/utils";
import { Keyboard, MousePointer2, Fingerprint, Activity, Cpu, ShieldCheck } from "lucide-react";

const PROFILE: BehavioralProfile = {
  userId: "usr_1000",
  baselineTypingCpm: 240,
  baselineMouseVelocity: 420,
  baselineActiveHours: [8, 9, 10, 11, 13, 14, 15, 16, 20, 21, 22],
  knownDeviceIds: [],
  knownLocations: ["Riyadh, SA"],
  samples: 64,
  confidence: 88,
  lastUpdated: new Date().toISOString(),
};

const SAMPLE_TEXT =
  "My national identity is protected by Absher Neuron. I authorize this secure session.";

export function BehavioralLab() {
  const ks = useRef(new KeystrokeCollector());
  const ptr = useRef(new PointerCollector());
  const [typed, setTyped] = useState("");
  const [device, setDevice] = useState<DeviceFingerprint | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [signals, setSignals] = useState({ typingSpeedCpm: 0, mouseVelocity: 0, mouseJitter: 0, interactionCount: 0 });

  useEffect(() => {
    collectFingerprint().then(setDevice);
  }, []);

  const recompute = useCallback(() => {
    if (!device) return;
    const sig = buildSignals(ks.current.snapshot(), ptr.current.snapshot());
    setSignals({
      typingSpeedCpm: sig.typingSpeedCpm,
      mouseVelocity: sig.mouseVelocity,
      mouseJitter: sig.mouseJitter,
      interactionCount: sig.interactionCount,
    });
    const ctx: ScoringContext = {
      signals: sig,
      profile: PROFILE,
      device: { ...device, trusted: true },
      network: {
        ip: "0.0.0.0", asn: "AS25019", isp: "STC", connectionType: "wifi",
        vpnDetected: false, torDetected: false, proxyDetected: false, ipReputation: 92,
      },
      geo: { country: "Saudi Arabia", countryCode: "SA", city: "Riyadh", lat: 24.71, lng: 46.68, expectedRegion: true },
      hourOfDay: new Date().getHours(),
      failedAttempts: 0,
    };
    setAssessment(assessRisk(ctx));
  }, [device]);

  useEffect(() => {
    const id = setInterval(() => {
      if (typeof window !== "undefined") {
        // capture global pointer movement is wired below; periodic recompute
      }
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const onMouseMove = (e: React.MouseEvent) => {
    ptr.current.onMove(e.clientX, e.clientY);
  };

  const a = assessment;

  return (
    <div onMouseMove={onMouseMove}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Live Behavioral Capture"
            subtitle="Type the phrase below — keystroke dynamics & pointer biometrics are analyzed locally in your browser"
            icon={<Activity className="h-4 w-4" />}
          />
          <CardBody className="space-y-4">
            <div className="rounded-lg border border-edge/60 bg-panel-2/40 p-3 text-sm text-muted">
              <span className="text-neuron">↳</span> {SAMPLE_TEXT}
            </div>
            <textarea
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => ks.current.onKeyDown(e.key)}
              onKeyUp={(e) => { ks.current.onKeyUp(e.key); recompute(); }}
              placeholder="Start typing here to generate your behavioral signature…"
              rows={3}
              className="focus-ring w-full resize-none rounded-xl border border-edge bg-carbon/60 p-4 font-mono text-sm text-white placeholder:text-muted/60"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={<Keyboard className="h-3.5 w-3.5" />} label="Typing" value={`${signals.typingSpeedCpm} cpm`} />
              <Metric icon={<MousePointer2 className="h-3.5 w-3.5" />} label="Pointer" value={`${signals.mouseVelocity} px/s`} />
              <Metric icon={<Activity className="h-3.5 w-3.5" />} label="Jitter" value={`${(signals.mouseJitter * 100).toFixed(0)}%`} />
              <Metric icon={<Cpu className="h-3.5 w-3.5" />} label="Events" value={`${signals.interactionCount}`} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Identity Confidence" subtitle={a ? a.modelVersion : "awaiting input"} icon={<ShieldCheck className="h-4 w-4" />} />
          <CardBody className="flex flex-col items-center gap-4">
            <ScoreRing
              value={a?.trustScore ?? 0}
              label="Trust"
              sublabel={a ? a.decision.replace("_", " ").toUpperCase() : "—"}
              color={trustColor(a?.trustScore ?? 0)}
              size={150}
            />
            <div className="grid w-full grid-cols-2 gap-3">
              <MiniScore label="Risk" value={a?.riskScore ?? 0} color={scoreColor(a?.riskScore ?? 0)} />
              <MiniScore label="Confidence" value={a?.confidenceScore ?? 0} color="#3aa0ff" />
            </div>
            <Badge tone={a?.decision === "allow" ? "ok" : a?.decision === "block" ? "danger" : "warn"} className="w-full justify-center py-1.5">
              {a ? authText(a.decision) : "Awaiting behavioral samples"}
            </Badge>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Behavioral Dimensions" subtitle="Deviation from learned baseline" icon={<Fingerprint className="h-4 w-4" />} />
          <CardBody className="flex justify-center">
            <RadarChart
              axes={[
                { label: "Typing", value: a ? clampInv(a.breakdown, "Typing biometrics") : 60 },
                { label: "Pointer", value: a ? clampInv(a.breakdown, "Pointer dynamics") : 55 },
                { label: "Device", value: a ? clampInv(a.breakdown, "Device fingerprint") : 90 },
                { label: "Network", value: a ? clampInv(a.breakdown, "Network reputation") : 92 },
                { label: "Geo", value: a ? clampInv(a.breakdown, "Geo context") : 95 },
                { label: "Temporal", value: a ? clampInv(a.breakdown, "Temporal pattern") : 80 },
              ]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Explainable Risk Breakdown" subtitle="Weighted feature contributions" icon={<Activity className="h-4 w-4" />} />
          <CardBody className="space-y-2.5">
            {(a?.breakdown ?? []).slice(0, 8).map((b) => (
              <div key={b.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">{b.label}</span>
                  <span className="tnum" style={{ color: scoreColor(b.value) }}>{b.value}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${b.value}%`, background: scoreColor(b.value) }} />
                </div>
              </div>
            ))}
            {!a && <p className="py-6 text-center text-sm text-muted">Type above to generate a live, explainable risk assessment.</p>}
          </CardBody>
        </Card>
      </div>

      {a && (
        <Card className="mt-6">
          <CardHeader title="AI Reasoning" subtitle="Why this decision was made" />
          <CardBody>
            <ul className="space-y-2">
              {a.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.riskScore > 50 ? "bg-threat-high" : "bg-threat-safe")} />
                  {r}
                </li>
              ))}
            </ul>
            {a.requiredVerification.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-edge/40 pt-4">
                <span className="text-xs text-muted">Required step-up verification:</span>
                {a.requiredVerification.map((v) => (
                  <Badge key={v} tone="warn">{v.replace("_", " ")}</Badge>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function clampInv(breakdown: RiskAssessment["breakdown"], label: string): number {
  const b = breakdown.find((x) => x.label === label);
  return b ? Math.max(5, 100 - b.value) : 60;
}

function authText(d: string) {
  return {
    allow: "ACCESS GRANTED · Low Risk",
    step_up: "STEP-UP REQUIRED · OTP",
    challenge: "CHALLENGE · Face + OTP",
    block: "ACCESS BLOCKED · High Risk",
  }[d] ?? d;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-edge/60 bg-panel-2/40 p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted">{icon}{label}</div>
      <div className="tnum mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function MiniScore({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-edge/60 bg-panel-2/40 p-3 text-center">
      <div className="tnum text-xl font-bold" style={{ color }}>{Math.round(value)}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
