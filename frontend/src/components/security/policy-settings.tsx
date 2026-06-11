"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, ShieldCheck, Bell, Network, Brain } from "lucide-react";

interface Policy {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
}

const GROUPS: { title: string; icon: typeof ShieldCheck; policies: Policy[] }[] = [
  {
    title: "Adaptive Authentication", icon: ShieldCheck,
    policies: [
      { id: "rba", label: "Risk-Based Authentication", desc: "Escalate verification strength with assessed risk", enabled: true },
      { id: "geo", label: "Impossible-Travel Geo-Fencing", desc: "Block physically impossible session pairs", enabled: true },
      { id: "device", label: "Device Binding", desc: "Require enrollment for new device fingerprints", enabled: true },
      { id: "passwordless", label: "Passwordless Preferred", desc: "Prefer passkeys over passwords", enabled: false },
    ],
  },
  {
    title: "AI Engine", icon: Brain,
    policies: [
      { id: "iforest", label: "Isolation Forest Anomaly Detection", desc: "Unsupervised outlier scoring on session features", enabled: true },
      { id: "rf", label: "Random Forest Threat Classifier", desc: "Supervised threat category classification", enabled: true },
      { id: "cluster", label: "Behavioral Clustering", desc: "Peer-group baselining of identity behavior", enabled: true },
      { id: "autoresp", label: "Autonomous Response", desc: "Allow the engine to auto-contain critical threats", enabled: false },
    ],
  },
  {
    title: "Network Controls", icon: Network,
    policies: [
      { id: "tor", label: "Block TOR Exit Nodes", desc: "Deny authentication from TOR network", enabled: true },
      { id: "vpn", label: "Challenge VPN Connections", desc: "Step-up MFA on anonymizing networks", enabled: true },
      { id: "rep", label: "IP Reputation Filtering", desc: "Throttle low-reputation ASNs", enabled: true },
    ],
  },
  {
    title: "Notifications", icon: Bell,
    policies: [
      { id: "critical", label: "Critical Alert Paging", desc: "Page on-call responder for critical alerts", enabled: true },
      { id: "digest", label: "Daily Intelligence Digest", desc: "Email summary of threat posture", enabled: true },
      { id: "owner", label: "Identity-Owner Notifications", desc: "Notify citizens of high-risk activity", enabled: true },
    ],
  },
];

export function PolicySettings() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(GROUPS.flatMap((g) => g.policies.map((p) => [p.id, p.enabled]))),
  );
  const toggle = (id: string) => setState((s) => ({ ...s, [id]: !s[id] }));
  const enabledCount = Object.values(state).filter(Boolean).length;

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Badge tone="neuron"><SlidersHorizontal className="h-3 w-3" /> {enabledCount} active policies</Badge>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {GROUPS.map((g) => {
          const Icon = g.icon;
          return (
            <Card key={g.title}>
              <CardHeader title={g.title} icon={<Icon className="h-4 w-4" />} />
              <CardBody className="space-y-2">
                {g.policies.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border border-edge/50 bg-panel-2/30 p-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{p.label}</div>
                      <div className="text-xs text-muted">{p.desc}</div>
                    </div>
                    <button
                      role="switch"
                      aria-checked={state[p.id]}
                      onClick={() => toggle(p.id)}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-ring",
                        state[p.id] ? "bg-neuron" : "bg-edge",
                      )}
                    >
                      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", state[p.id] ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                ))}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
