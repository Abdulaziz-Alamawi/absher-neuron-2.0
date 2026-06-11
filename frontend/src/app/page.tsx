import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/security/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { ThreatFeed } from "@/components/security/threat-feed";
import { ThreatMap } from "@/components/security/threat-map";
import { ScoreRing } from "@/components/charts/score-ring";
import { Donut } from "@/components/charts/donut";
import { Heatmap } from "@/components/charts/heatmap";
import { AreaChart } from "@/components/charts/area-chart";
import { Badge } from "@/components/ui/badge";
import { LiveBlockedCounter } from "@/components/security/live-counter";
import {
  getThreats, getKpis, severityDistribution, timeSeries, geoAggregate,
} from "@/lib/api/server";
import { ShieldCheck, Users, Siren, Gauge, Timer, Cpu, Radio, Globe2 } from "lucide-react";
import { severityColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CommandCenter() {
  const { threats } = await getThreats({ limit: 60 });
  const kpis = await getKpis();
  const dist = severityDistribution(threats);
  const geo = geoAggregate(threats).slice(0, 6);

  const trafficSeries = timeSeries(11, 24, 120, 60, 1.2);
  const blockedSeries = timeSeries(22, 24, 40, 30, 0.4);
  const trustSeries = timeSeries(33, 24, 84, 8);

  const hours = Array.from({ length: 24 }, (_, i) => (i % 6 === 0 ? `${i}` : ""));
  const matrix = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      const base = (h >= 1 && h <= 5 ? 60 : 20) + (d >= 4 ? 18 : 0);
      return Math.min(100, Math.round(base + ((d * 7 + h * 13) % 35)));
    }),
  );

  return (
    <AppShell
      title="National Security Command Center"
      subtitle="Live identity threat operations · Kingdom-wide"
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard id="k1" label="Identities Protected" value={kpis.identitiesProtected} delta={2.3} icon={<Users className="h-4 w-4" />} spark={trustSeries} />
        <LiveBlockedCounter base={kpis.threatsBlockedToday} spark={blockedSeries} />
        <StatCard id="k3" label="Active Incidents" value={kpis.activeIncidents} delta={-12} deltaPositiveIsGood={false} icon={<Siren className="h-4 w-4" />} sparkColor="#ff7a18" spark={timeSeries(44, 24, 8, 4)} />
        <StatCard id="k4" label="Model Accuracy" value={kpis.modelAccuracy} suffix="%" delta={0.4} icon={<Cpu className="h-4 w-4" />} spark={timeSeries(55, 24, 97, 1)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Global Threat Origins"
            subtitle="Real-time attack telemetry converging on the Riyadh SOC"
            icon={<Globe2 className="h-4 w-4" />}
            action={<Badge tone="neuron"><Radio className="h-3 w-3" /> LIVE</Badge>}
          />
          <CardBody>
            <ThreatMap seed={threats} />
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {geo.map((g) => (
                <div key={g.cc} className="rounded-lg border border-edge/60 bg-panel-2/40 p-2 text-center">
                  <div className="text-[11px] font-semibold text-white">{g.cc}</div>
                  <div className="tnum text-lg font-bold" style={{ color: severityColor.high }}>{g.count}</div>
                  <div className="text-[9px] uppercase text-muted">{g.country.split(" ")[0]}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Live Threat Stream" subtitle="Adaptive auth decisions" icon={<Radio className="h-4 w-4" />} />
          <div className="flex-1 overflow-hidden">
            <ThreatFeed seed={threats} limit={9} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Identity Trust Posture" subtitle="Kingdom-wide aggregate" icon={<ShieldCheck className="h-4 w-4" />} />
          <CardBody className="flex items-center justify-around">
            <ScoreRing value={kpis.avgTrustScore} label="Trust" color="#1ee08a" />
            <div className="space-y-3">
              <PostureRow label="Mean Time to Detect" value={`${kpis.meanTimeToDetectSec}s`} icon={<Timer className="h-3.5 w-3.5" />} />
              <PostureRow label="Mean Time to Respond" value={`${Math.round(kpis.meanTimeToRespondSec / 60)}m`} icon={<Gauge className="h-3.5 w-3.5" />} />
              <PostureRow label="Live Sessions" value={kpis.liveSessions.toLocaleString()} icon={<Radio className="h-3.5 w-3.5" />} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Threat Severity Mix" subtitle="Last 24 hours" icon={<Siren className="h-4 w-4" />} />
          <CardBody>
            <Donut
              data={[
                { label: "Critical", value: dist.critical, color: severityColor.critical },
                { label: "High", value: dist.high, color: severityColor.high },
                { label: "Medium", value: dist.medium, color: severityColor.medium },
                { label: "Low", value: dist.low, color: severityColor.low },
                { label: "Info", value: dist.info, color: severityColor.info },
              ]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Authentication Volume" subtitle="Requests / hour" icon={<Gauge className="h-4 w-4" />} />
          <CardBody>
            <AreaChart data={trafficSeries} id="auth-vol" height={120} color="#3aa0ff" />
            <div className="mt-3 flex justify-between text-[10px] text-muted">
              <span>-24h</span><span>now</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Risk Heatmap"
            subtitle="Composite identity-risk intensity by day & hour"
            icon={<Gauge className="h-4 w-4" />}
            action={
              <div className="flex items-center gap-2 text-[10px] text-muted">
                <span>Low</span>
                <div className="h-2 w-24 rounded-full bg-gradient-to-r from-threat-safe via-threat-medium to-threat-critical" />
                <span>Critical</span>
              </div>
            }
          />
          <CardBody>
            <Heatmap matrix={matrix} rowLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]} colLabels={hours} />
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}

function PostureRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-edge bg-panel-2/60 text-neuron">{icon}</span>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
        <div className="tnum text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}
