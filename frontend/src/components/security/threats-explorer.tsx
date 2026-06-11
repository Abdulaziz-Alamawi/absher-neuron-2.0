"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/table";
import { SeverityBadge, Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { PageIntro } from "@/components/security/section";
import { THREAT_LABELS, CATEGORIES } from "@/lib/data/catalog";
import { scoreColor, timeAgo, severityColor } from "@/lib/utils";
import type { ThreatEvent, MetricPoint, Severity, ThreatCategory } from "@/lib/types";
import { Filter, MapPin, Crosshair } from "lucide-react";

const SEVS: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];

export function ThreatsExplorer({ threats, trend }: { threats: ThreatEvent[]; trend: MetricPoint[] }) {
  const [sev, setSev] = useState<Severity | "all">("all");
  const [cat, setCat] = useState<ThreatCategory | "all">("all");

  const filtered = useMemo(
    () => threats.filter((t) => (sev === "all" || t.severity === sev) && (cat === "all" || t.category === cat)),
    [threats, sev, cat],
  );

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of threats) m.set(t.category, (m.get(t.category) ?? 0) + 1);
    return CATEGORIES.map((c) => ({ label: c.split("_")[0], value: m.get(c) ?? 0, color: severityColor.high }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [threats]);

  const columns: Column<ThreatEvent>[] = [
    {
      key: "threat", header: "Threat", render: (t) => (
        <div>
          <div className="font-medium text-white">{THREAT_LABELS[t.category]}</div>
          <div className="text-xs text-muted">{t.userName} · {t.userId}</div>
        </div>
      ),
    },
    { key: "sev", header: "Severity", render: (t) => <SeverityBadge severity={t.severity} /> },
    {
      key: "origin", header: "Origin", render: (t) => (
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3 w-3" /> {t.geo.city}, {t.geo.countryCode}
        </span>
      ),
    },
    { key: "mitre", header: "MITRE", render: (t) => <span className="tnum text-xs text-threat-low">{t.mitre}</span> },
    {
      key: "risk", header: "Risk", align: "right", render: (t) => (
        <span className="tnum font-bold" style={{ color: scoreColor(t.riskScore) }}>{t.riskScore}</span>
      ),
    },
    { key: "conf", header: "AI Conf.", align: "right", render: (t) => <span className="tnum text-muted">{t.confidence}%</span> },
    {
      key: "decision", header: "Decision", render: (t) => (
        <Badge tone={t.decision === "block" ? "danger" : t.decision === "challenge" ? "warn" : t.decision === "allow" ? "ok" : "neutral"}>
          {t.decision.replace("_", " ")}
        </Badge>
      ),
    },
    { key: "time", header: "Detected", align: "right", render: (t) => <span className="text-xs text-muted">{timeAgo(t.timestamp)}</span> },
  ];

  return (
    <>
      <PageIntro
        eyebrow="Predictive Threat Engine"
        title="Threat Intelligence"
        description="Ensemble of Isolation Forest, Random Forest and behavioral clustering models scoring every authentication in real time."
        actions={<Badge tone="neuron"><Crosshair className="h-3 w-3" /> {filtered.length} matches</Badge>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Detection Volume" subtitle="Threats scored per hour (24h)" />
          <CardBody>
            <AreaChart data={trend} id="threat-trend" height={140} color="#ff7a18" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Attack Surface" subtitle="By category" />
          <CardBody>
            <BarChart data={byCategory} height={140} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Threat Registry"
          subtitle="Full detection ledger"
          icon={<Filter className="h-4 w-4" />}
          action={
            <div className="flex flex-wrap gap-1.5">
              {SEVS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSev(s)}
                  className={`chip border transition ${sev === s ? "border-neuron/50 bg-neuron/10 text-neuron" : "border-edge text-muted hover:text-white"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          }
        />
        <CardBody className="p-0">
          <div className="flex flex-wrap gap-1.5 border-b border-edge/40 px-4 py-3">
            <button onClick={() => setCat("all")} className={`chip border ${cat === "all" ? "border-neuron/50 bg-neuron/10 text-neuron" : "border-edge text-muted"}`}>all categories</button>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`chip border ${cat === c ? "border-neuron/50 bg-neuron/10 text-neuron" : "border-edge text-muted hover:text-white"}`}>
                {c.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <DataTable columns={columns} rows={filtered} />
        </CardBody>
      </Card>
    </>
  );
}
