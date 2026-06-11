import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge, SeverityBadge } from "@/components/ui/badge";
import { PageIntro } from "@/components/security/section";
import { getThreats } from "@/lib/api/server";
import { THREAT_LABELS } from "@/lib/data/catalog";
import { scoreColor, timeAgo } from "@/lib/utils";
import { FileSearch, GitBranch, Terminal, Network, Crosshair } from "lucide-react";

export const metadata = { title: "Investigation" };
export const dynamic = "force-dynamic";

const KILL_CHAIN = [
  { phase: "Reconnaissance", detail: "Credential stuffing list probed against identity endpoint", active: true },
  { phase: "Initial Access", detail: "Valid credentials replayed from anomalous ASN", active: true },
  { phase: "Defense Evasion", detail: "Device fingerprint spoofing attempt detected", active: true },
  { phase: "Credential Access", detail: "Step-up MFA challenge triggered by risk engine", active: false },
  { phase: "Impact", detail: "Session blocked before any identity operation", active: false },
];

export default async function InvestigatePage() {
  const { threats: all } = await getThreats({ limit: 40 });
  const threats = all.filter((t) => t.riskScore > 55).slice(0, 12);
  const focus = threats[0];

  return (
    <AppShell title="Investigation Console" subtitle="Threat hunting & digital forensics">
      <PageIntro
        eyebrow="Threat Hunting"
        title="Investigation"
        description="Pivot across identities, devices, networks and sessions to reconstruct the full attack narrative."
      />

      <Card className="mb-6">
        <CardBody className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-neuron" />
          <input
            defaultValue={`risk:>55 AND category:account_takeover | last 24h`}
            className="flex-1 bg-transparent font-mono text-sm text-neuron placeholder:text-muted focus:outline-none"
          />
          <Badge tone="neuron"><Crosshair className="h-3 w-3" /> {threats.length} hits</Badge>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Indicator Matches" subtitle="High-risk events" icon={<FileSearch className="h-4 w-4" />} />
          <CardBody className="space-y-2">
            {threats.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border border-edge/50 bg-panel-2/30 p-3 font-mono text-xs">
                <span className="text-muted">{new Date(t.timestamp).toISOString().slice(11, 19)}</span>
                <SeverityBadge severity={t.severity} />
                <span className="text-white">{THREAT_LABELS[t.category]}</span>
                <span className="text-muted">src={t.sourceIp}</span>
                <span className="ml-auto tnum font-bold" style={{ color: scoreColor(t.riskScore) }}>{t.riskScore}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Cyber Kill Chain" subtitle="Reconstructed attack path" icon={<GitBranch className="h-4 w-4" />} />
          <CardBody>
            <div className="relative space-y-4 border-l border-edge pl-5">
              {KILL_CHAIN.map((k, i) => (
                <div key={i} className="relative">
                  <span className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 ${k.active ? "border-threat-critical bg-threat-critical/30" : "border-threat-safe bg-carbon"}`} />
                  <div className="text-sm font-medium text-white">{k.phase}</div>
                  <div className="text-xs text-muted">{k.detail}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {focus && (
        <Card className="mt-6">
          <CardHeader title="Entity Relationship Graph" subtitle={`Focus: ${focus.userName}`} icon={<Network className="h-4 w-4" />} />
          <CardBody>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Entity label="Identity" value={focus.userName} sub={focus.userId} />
              <Entity label="Source IP" value={focus.sourceIp} sub={focus.geo.country} />
              <Entity label="Geo" value={`${focus.geo.city}, ${focus.geo.countryCode}`} sub={focus.geo.expectedRegion ? "expected" : "anomalous"} />
              <Entity label="MITRE" value={focus.mitre ?? "—"} sub={focus.category.replace(/_/g, " ")} />
            </div>
            <p className="mt-4 text-sm text-muted">{focus.description} Detected {timeAgo(focus.timestamp)} with {focus.confidence}% model confidence.</p>
          </CardBody>
        </Card>
      )}
    </AppShell>
  );
}

function Entity({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-edge/60 bg-panel-2/40 p-3">
      <div className="stat-label">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-white">{value}</div>
      <div className="truncate text-[10px] text-muted">{sub}</div>
    </div>
  );
}
