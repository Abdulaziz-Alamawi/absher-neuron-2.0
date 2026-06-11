import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Donut } from "@/components/charts/donut";
import { ScoreRing } from "@/components/charts/score-ring";
import { PageIntro } from "@/components/security/section";
import { StatCard } from "@/components/security/stat-card";
import { Badge } from "@/components/ui/badge";
import { getThreats, timeSeries, severityDistribution } from "@/lib/api/server";
import { CATEGORIES, THREAT_LABELS } from "@/lib/data/catalog";
import { severityColor } from "@/lib/utils";
import { TrendingUp, Users, LineChart, PieChart, Brain } from "lucide-react";

export const metadata = { title: "Security Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { threats } = await getThreats({ limit: 120 });
  const dist = severityDistribution(threats);

  const loginTrend = timeSeries(101, 30, 5200, 1200, 20);
  const riskTrend = timeSeries(102, 30, 42, 18, -0.3);
  const scoreHistory = timeSeries(103, 30, 82, 6, 0.2);
  const forecast = timeSeries(104, 14, 60, 22, 1.5);

  const catCounts = CATEGORIES.map((c) => ({
    label: c.split("_")[0],
    value: threats.filter((t) => t.category === c).length,
    color: severityColor.low,
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  const riskBuckets = [
    { label: "0-20", value: threats.filter((t) => t.riskScore < 20).length, color: severityColor.safe },
    { label: "20-40", value: threats.filter((t) => t.riskScore >= 20 && t.riskScore < 40).length, color: severityColor.low },
    { label: "40-60", value: threats.filter((t) => t.riskScore >= 40 && t.riskScore < 60).length, color: severityColor.medium },
    { label: "60-80", value: threats.filter((t) => t.riskScore >= 60 && t.riskScore < 80).length, color: severityColor.high },
    { label: "80-100", value: threats.filter((t) => t.riskScore >= 80).length, color: severityColor.critical },
  ];

  return (
    <AppShell title="AI Security Analytics" subtitle="Trends, distributions and predictive forecasts">
      <PageIntro
        eyebrow="Intelligence & Forecasting"
        title="Security Analytics"
        description="Longitudinal behavioral and threat analytics with model-driven attack forecasting."
        actions={<Badge tone="neuron"><Brain className="h-3 w-3" /> 30-day window</Badge>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard id="a1" label="Total Logins (30d)" value={148293} delta={6.2} icon={<Users className="h-4 w-4" />} spark={loginTrend} />
        <StatCard id="a2" label="Avg Risk Score" value={38} delta={-4.1} deltaPositiveIsGood={false} icon={<TrendingUp className="h-4 w-4" />} sparkColor="#ffb020" spark={riskTrend} />
        <StatCard id="a3" label="Avg Trust Score" value={84} suffix="/100" delta={1.8} icon={<LineChart className="h-4 w-4" />} sparkColor="#1ee08a" spark={scoreHistory} />
        <StatCard id="a4" label="Forecasted Attacks (14d)" value={892} delta={11.4} deltaPositiveIsGood={false} icon={<TrendingUp className="h-4 w-4" />} sparkColor="#ff2d55" spark={forecast} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Login Analytics" subtitle="Authentication volume · 30 days" icon={<LineChart className="h-4 w-4" />} />
          <CardBody><AreaChart data={loginTrend} id="login-an" height={160} color="#3aa0ff" /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Severity Distribution" icon={<PieChart className="h-4 w-4" />} />
          <CardBody>
            <Donut data={[
              { label: "Critical", value: dist.critical, color: severityColor.critical },
              { label: "High", value: dist.high, color: severityColor.high },
              { label: "Medium", value: dist.medium, color: severityColor.medium },
              { label: "Low", value: dist.low, color: severityColor.low },
            ]} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Risk Distribution" subtitle="Score buckets" />
          <CardBody><BarChart data={riskBuckets} height={150} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Threat Categories" subtitle="By frequency" />
          <CardBody><BarChart data={catCounts} height={150} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Model Performance" subtitle="Ensemble metrics" />
          <CardBody className="flex items-center justify-around">
            <ScoreRing value={97} label="Precision" size={104} color="#1ee0c5" />
            <div className="space-y-3">
              <MetricLine label="Recall" value={94} color="#3aa0ff" />
              <MetricLine label="F1 Score" value={95} color="#1ee08a" />
              <MetricLine label="AUC-ROC" value={98} color="#ffb020" />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Attack Forecast" subtitle="14-day predictive projection (gradient-boosted model)" icon={<TrendingUp className="h-4 w-4" />} action={<Badge tone="warn">XGBoost</Badge>} />
        <CardBody>
          <AreaChart data={[...riskTrend.slice(-8), ...forecast]} id="forecast" height={170} color="#ff7a18" />
          <div className="mt-3 flex justify-between text-[10px] text-muted">
            <span>historical</span><span className="text-threat-high">— forecast horizon →</span>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Top Targeted Operations" subtitle="Highest-risk identity services" />
        <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.slice(0, 5).map((c, i) => (
            <div key={c} className="rounded-xl border border-edge/60 bg-panel-2/40 p-4">
              <div className="text-xs text-muted">{THREAT_LABELS[c]}</div>
              <div className="tnum mt-2 text-2xl font-bold text-white">{120 - i * 17}</div>
              <div className="mt-1 text-[10px] text-threat-high">+{18 - i * 2}% vs last week</div>
            </div>
          ))}
        </CardBody>
      </Card>
    </AppShell>
  );
}

function MetricLine({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="w-32">
      <div className="flex justify-between text-xs"><span className="text-muted">{label}</span><span className="tnum text-white">{value}%</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel-2"><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );
}
