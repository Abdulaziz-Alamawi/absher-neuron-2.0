"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { SeverityBadge, Badge } from "@/components/ui/badge";
import { useRealtime } from "@/lib/realtime/store";
import { timeAgo, scoreColor, cn } from "@/lib/utils";
import type { SecurityAlert, Severity } from "@/lib/types";
import { Siren, CheckCircle2, ChevronRight, Bot, ListChecks } from "lucide-react";

const SEVS: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];

export function AlertCenter({ seed }: { seed: SecurityAlert[] }) {
  const live = useRealtime((s) => s.liveAlerts);
  const all = useMemo(() => [...live, ...seed], [live, seed]);
  const [sev, setSev] = useState<Severity | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(seed[0]?.id ?? null);

  const filtered = all.filter((a) => sev === "all" || a.severity === sev);
  const selected = all.find((a) => a.id === selectedId) ?? filtered[0] ?? null;

  const counts = (s: Severity) => all.filter((a) => a.severity === s).length;

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["critical", "high", "medium", "low"] as Severity[]).map((s) => (
          <button key={s} onClick={() => setSev(s)} className="glass glass-hover p-4 text-left">
            <div className="flex items-center justify-between">
              <SeverityBadge severity={s} />
              <span className="tnum text-2xl font-bold" style={{ color: scoreColor(s === "critical" ? 90 : s === "high" ? 70 : s === "medium" ? 50 : 25) }}>
                {counts(s)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Security Alerts"
            subtitle={`${filtered.length} alert(s)`}
            icon={<Siren className="h-4 w-4" />}
            action={
              <div className="flex flex-wrap gap-1.5">
                {SEVS.map((s) => (
                  <button key={s} onClick={() => setSev(s)} className={cn("chip border", sev === s ? "border-neuron/50 bg-neuron/10 text-neuron" : "border-edge text-muted")}>{s}</button>
                ))}
              </div>
            }
          />
          <CardBody className="max-h-[640px] space-y-2 overflow-y-auto p-3">
            <AnimatePresence initial={false}>
              {filtered.map((a) => (
                <motion.button
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                    selected?.id === a.id ? "border-neuron/50 bg-neuron/5" : "border-edge/50 bg-panel-2/30 hover:border-edge",
                  )}
                >
                  <div className="h-9 w-1 rounded-full" style={{ background: scoreColor(a.riskScore) }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-white">{a.title}</span>
                      <SeverityBadge severity={a.severity} />
                      {a.status === "new" && <Badge tone="neuron">new</Badge>}
                    </div>
                    <div className="truncate text-xs text-muted">{a.userName} · {timeAgo(a.createdAt)}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted" />
                </motion.button>
              ))}
            </AnimatePresence>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Alert Detail" subtitle="AI explanation & response" icon={<Bot className="h-4 w-4" />} />
          <CardBody>
            {selected ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={selected.severity} />
                    <Badge tone="neutral">{selected.category.replace(/_/g, " ")}</Badge>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">{selected.title}</h3>
                  <p className="text-xs text-muted">{selected.userName} · {selected.userId}</p>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-edge/60 bg-panel-2/40 p-4">
                  <div className="text-center">
                    <div className="tnum text-2xl font-bold" style={{ color: scoreColor(selected.riskScore) }}>{selected.riskScore}</div>
                    <div className="stat-label">Risk</div>
                  </div>
                  <div className="h-10 w-px bg-edge" />
                  <div className="text-center">
                    <div className="tnum text-2xl font-bold text-threat-low">{selected.aiConfidence}%</div>
                    <div className="stat-label">AI Confidence</div>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><Bot className="h-3.5 w-3.5" /> AI Explanation</div>
                  <p className="text-sm leading-relaxed text-muted">{selected.explanation}</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><ListChecks className="h-3.5 w-3.5" /> Recommended Actions</div>
                  <div className="space-y-2">
                    {selected.recommendedActions.map((act, i) => (
                      <label key={i} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-edge/50 bg-panel-2/30 p-2.5 text-sm text-white transition hover:border-neuron/40">
                        <input type="checkbox" className="h-4 w-4 accent-[#1ee0c5]" />
                        {act}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="focus-ring flex-1 rounded-lg bg-neuron py-2.5 text-sm font-semibold text-abyss transition hover:bg-neuron/90">
                    <CheckCircle2 className="mr-1.5 inline h-4 w-4" /> Resolve
                  </button>
                  <button className="focus-ring rounded-lg border border-edge bg-panel-2/60 px-4 py-2.5 text-sm font-medium text-muted transition hover:text-white">Dismiss</button>
                </div>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted">Select an alert to view details.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
