"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { SeverityBadge, Badge } from "@/components/ui/badge";
import { timeAgo, scoreColor, cn } from "@/lib/utils";
import type { Incident } from "@/lib/types";
import { ShieldAlert, Clock, UserCheck, Zap, CheckCircle2, Circle } from "lucide-react";

const STATUS_TONE: Record<string, "danger" | "warn" | "neuron" | "ok" | "neutral"> = {
  open: "danger", investigating: "warn", contained: "neuron", resolved: "ok", closed: "neutral",
};

export function IncidentBoard({ incidents }: { incidents: Incident[] }) {
  const [id, setId] = useState(incidents[0]?.id);
  const inc = incidents.find((i) => i.id === id) ?? incidents[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader title="Active Incidents" subtitle={`${incidents.length} tracked`} icon={<ShieldAlert className="h-4 w-4" />} />
        <CardBody className="space-y-2 p-3">
          {incidents.map((i) => (
            <button
              key={i.id}
              onClick={() => setId(i.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                inc?.id === i.id ? "border-neuron/50 bg-neuron/5" : "border-edge/50 bg-panel-2/30 hover:border-edge",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-white">{i.title}</span>
                <SeverityBadge severity={i.severity} />
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                <Badge tone={STATUS_TONE[i.status]}>{i.status}</Badge>
                <span>· {i.affectedUsers} users</span>
                <span className="ml-auto">{timeAgo(i.openedAt)}</span>
              </div>
            </button>
          ))}
        </CardBody>
      </Card>

      <Card className="lg:col-span-3">
        {inc && (
          <>
            <CardHeader
              title={inc.title}
              subtitle={`${inc.id} · assigned to ${inc.assignee}`}
              icon={<ShieldAlert className="h-4 w-4" />}
              action={<Badge tone={STATUS_TONE[inc.status]}>{inc.status}</Badge>}
            />
            <CardBody className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Severity" value={inc.severity} />
                <Stat label="Risk" value={`${inc.riskScore}`} color={scoreColor(inc.riskScore)} />
                <Stat label="Affected" value={`${inc.affectedUsers}`} />
                <Stat label="Category" value={inc.category.replace(/_/g, " ")} />
              </div>

              <p className="rounded-xl border border-edge/60 bg-panel-2/40 p-4 text-sm text-muted">{inc.summary}</p>

              <div>
                <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><Clock className="h-3.5 w-3.5" /> Incident Timeline</div>
                <div className="relative space-y-4 border-l border-edge pl-5">
                  {inc.timeline.map((ev, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-neuron bg-carbon" />
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        {ev.action}
                        <span className="text-[10px] font-normal text-muted">· {ev.actor}</span>
                      </div>
                      <div className="text-xs text-muted">{ev.detail}</div>
                      <div className="text-[10px] text-muted/70">{timeAgo(ev.at)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><Zap className="h-3.5 w-3.5" /> Automated Response Actions</div>
                <div className="space-y-2">
                  {inc.responseActions.map((ra) => (
                    <div key={ra.id} className="flex items-center gap-3 rounded-lg border border-edge/50 bg-panel-2/30 p-3">
                      {ra.executed ? <CheckCircle2 className="h-4 w-4 text-threat-safe" /> : <Circle className="h-4 w-4 text-muted" />}
                      <span className="flex-1 text-sm text-white">{ra.label}</span>
                      {ra.automated && <Badge tone="neuron">auto</Badge>}
                      <Badge tone={ra.executed ? "ok" : "warn"}>{ra.executed ? "executed" : "pending"}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 border-t border-edge/40 pt-4">
                <button className="focus-ring flex-1 rounded-lg bg-neuron py-2.5 text-sm font-semibold text-abyss"><UserCheck className="mr-1.5 inline h-4 w-4" /> Contain Incident</button>
                <button className="focus-ring rounded-lg border border-edge bg-panel-2/60 px-4 py-2.5 text-sm font-medium text-muted hover:text-white">Escalate</button>
              </div>
            </CardBody>
          </>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-edge/60 bg-panel-2/40 p-3">
      <div className="stat-label">{label}</div>
      <div className="mt-1 text-sm font-bold capitalize" style={{ color: color ?? "#fff" }}>{value}</div>
    </div>
  );
}
