"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/charts/score-ring";
import { cn } from "@/lib/utils";
import {
  KeyRound, ScanFace, Camera, Mic, PhoneCall, Check, Loader2, ShieldAlert, Play,
} from "lucide-react";
import type { VerificationMethod } from "@/lib/types";

interface Step {
  method: VerificationMethod;
  label: string;
  desc: string;
  icon: typeof KeyRound;
}

const RISK_LEVELS = [
  { label: "Low Risk", risk: 18, methods: ["otp"] as VerificationMethod[] },
  { label: "Elevated", risk: 48, methods: ["otp", "face"] as VerificationMethod[] },
  { label: "High Risk", risk: 72, methods: ["otp", "face", "voice"] as VerificationMethod[] },
  { label: "Critical", risk: 91, methods: ["otp", "live_camera", "voice", "phone_call"] as VerificationMethod[] },
];

const STEP_META: Record<VerificationMethod, Step> = {
  otp: { method: "otp", label: "OTP Verification", desc: "6-digit code via Absher app / SMS", icon: KeyRound },
  face: { method: "face", label: "Face Verification", desc: "Match against enrolled identity template", icon: ScanFace },
  live_camera: { method: "live_camera", label: "Live Camera Liveness", desc: "Active liveness & anti-spoof detection", icon: Camera },
  voice: { method: "voice", label: "Voice Verification", desc: "Voiceprint match with passphrase", icon: Mic },
  phone_call: { method: "phone_call", label: "Automated Phone Call", desc: "Out-of-band callback confirmation", icon: PhoneCall },
};

export function VerificationCenter() {
  const [level, setLevel] = useState(2);
  const methods = RISK_LEVELS[level].methods;
  const [status, setStatus] = useState<Record<string, "idle" | "running" | "done">>({});
  const [camOn, setCamOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setStatus({});
    stopCam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  useEffect(() => () => stopCam(), []);

  function stopCam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }

  async function startCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch {
      setCamOn(false);
    }
  }

  function runStep(m: VerificationMethod) {
    setStatus((s) => ({ ...s, [m]: "running" }));
    setTimeout(() => setStatus((s) => ({ ...s, [m]: "done" })), 1400 + Math.random() * 900);
  }

  const completed = methods.filter((m) => status[m] === "done").length;
  const progress = Math.round((completed / methods.length) * 100);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader
            title="Risk-Based Authentication"
            subtitle="Higher assessed risk escalates verification strength automatically"
            icon={<ShieldAlert className="h-4 w-4" />}
          />
          <CardBody>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RISK_LEVELS.map((r, i) => (
                <button
                  key={r.label}
                  onClick={() => setLevel(i)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    level === i ? "border-neuron/50 bg-neuron/10" : "border-edge bg-panel-2/40 hover:border-edge",
                  )}
                >
                  <div className="text-xs font-semibold text-white">{r.label}</div>
                  <div className="tnum mt-1 text-lg font-bold" style={{ color: r.risk > 70 ? "#ff2d55" : r.risk > 40 ? "#ffb020" : "#1ee08a" }}>
                    {r.risk}
                  </div>
                  <div className="text-[10px] text-muted">{r.methods.length} factor(s)</div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Verification Workflow" subtitle={`${methods.length}-factor adaptive challenge`} />
          <CardBody className="space-y-3">
            {methods.map((m, i) => {
              const meta = STEP_META[m];
              const Icon = meta.icon;
              const st = status[m] ?? "idle";
              return (
                <div key={m} className="rounded-xl border border-edge/60 bg-panel-2/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border",
                      st === "done" ? "border-threat-safe/50 bg-threat-safe/10 text-threat-safe" : "border-edge bg-carbon text-neuron",
                    )}>
                      {st === "done" ? <Check className="h-5 w-5" /> : st === "running" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <span className="tnum text-muted">{i + 1}.</span> {meta.label}
                      </div>
                      <div className="text-xs text-muted">{meta.desc}</div>
                    </div>
                    {st === "done" ? (
                      <Badge tone="ok">verified</Badge>
                    ) : (
                      <button
                        onClick={() => { runStep(m); if (m === "live_camera") startCam(); }}
                        disabled={st === "running"}
                        className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-neuron/40 bg-neuron/10 px-3 py-1.5 text-xs font-medium text-neuron transition hover:bg-neuron/20 disabled:opacity-50"
                      >
                        <Play className="h-3 w-3" /> {st === "running" ? "Verifying…" : "Start"}
                      </button>
                    )}
                  </div>

                  {m === "live_camera" && (st === "running" || camOn) && (
                    <div className="relative mt-3 overflow-hidden rounded-lg border border-neuron/30 bg-black">
                      <video ref={videoRef} autoPlay playsInline muted className="h-44 w-full object-cover" />
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neuron/70" />
                        <div className="absolute inset-x-0 top-0 h-0.5 animate-scan-line bg-neuron/70" />
                      </div>
                      <Badge tone="neuron" className="absolute left-2 top-2">liveness · analyzing</Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader title="Session Verification" subtitle={RISK_LEVELS[level].label} />
        <CardBody className="flex flex-col items-center gap-4">
          <ScoreRing value={progress} label="Verified" color={progress === 100 ? "#1ee08a" : "#3aa0ff"} />
          <div className="w-full space-y-2 text-sm">
            <Row label="Risk level" value={RISK_LEVELS[level].label} />
            <Row label="Factors required" value={`${methods.length}`} />
            <Row label="Factors passed" value={`${completed}/${methods.length}`} />
          </div>
          <Badge tone={progress === 100 ? "ok" : "warn"} className="w-full justify-center py-1.5">
            {progress === 100 ? "Identity fully verified" : "Verification in progress"}
          </Badge>
          <p className="text-center text-[11px] text-muted">
            Camera & microphone access is requested only for live liveness/voice checks and never leaves your device in this demo.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-edge/40 pb-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
