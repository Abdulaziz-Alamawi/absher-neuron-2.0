import { AppShell } from "@/components/layout/app-shell";
import { getThreats, timeSeries } from "@/lib/api/server";
import { ThreatsExplorer } from "@/components/security/threats-explorer";

export const metadata = { title: "Threat Intelligence" };
export const dynamic = "force-dynamic";

export default async function ThreatsPage() {
  const { threats } = await getThreats({ limit: 80 });
  const trend = timeSeries(91, 24, 50, 30, 0.8);
  return (
    <AppShell title="Threat Intelligence" subtitle="Predictive detection · MITRE ATT&CK mapped">
      <ThreatsExplorer threats={threats} trend={trend} />
    </AppShell>
  );
}
