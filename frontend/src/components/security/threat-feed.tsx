"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRealtime } from "@/lib/realtime/store";
import { SeverityBadge } from "@/components/ui/badge";
import { timeAgo, scoreColor } from "@/lib/utils";
import { THREAT_LABELS } from "@/lib/data/catalog";
import { MapPin, ShieldX, ShieldAlert, ShieldQuestion, ShieldCheck } from "lucide-react";
import type { ThreatEvent } from "@/lib/types";

const decisionIcon = {
  block: ShieldX,
  challenge: ShieldAlert,
  step_up: ShieldQuestion,
  allow: ShieldCheck,
} as const;

const decisionColor = {
  block: "text-threat-critical",
  challenge: "text-threat-high",
  step_up: "text-threat-medium",
  allow: "text-threat-safe",
} as const;

export function ThreatFeed({ seed = [], limit = 12 }: { seed?: ThreatEvent[]; limit?: number }) {
  const live = useRealtime((s) => s.liveEvents);
  const merged = [...live, ...seed].slice(0, limit);

  return (
    <div className="divide-y divide-edge/40">
      <AnimatePresence initial={false}>
        {merged.map((e) => {
          const Icon = decisionIcon[e.decision];
          return (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, x: -12, backgroundColor: "rgba(30,224,197,0.06)" }}
              animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 px-5 py-3"
            >
              <Icon className={`h-5 w-5 shrink-0 ${decisionColor[e.decision]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-white">{THREAT_LABELS[e.category]}</span>
                  <SeverityBadge severity={e.severity} />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  <span className="truncate">{e.userName}</span>
                  <span className="text-edge">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {e.geo.city}, {e.geo.countryCode}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="tnum text-sm font-bold" style={{ color: scoreColor(e.riskScore) }}>
                  {e.riskScore}
                </div>
                <div className="text-[10px] text-muted">{timeAgo(e.timestamp)}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {merged.length === 0 && (
        <div className="px-5 py-10 text-center text-sm text-muted">Awaiting live telemetry…</div>
      )}
    </div>
  );
}
