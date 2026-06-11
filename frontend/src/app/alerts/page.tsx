import { AppShell } from "@/components/layout/app-shell";
import { AlertCenter } from "@/components/security/alert-center";
import { PageIntro } from "@/components/security/section";
import { getAlerts } from "@/lib/api/server";

export const metadata = { title: "Alert Center" };
export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const { alerts } = await getAlerts({ limit: 28 });
  return (
    <AppShell title="Security Alert Center" subtitle="Triage · explain · respond">
      <PageIntro
        eyebrow="Detection & Response"
        title="Alert Center"
        description="Every alert ships with an AI confidence score, a plain-language explanation and a recommended response playbook."
      />
      <AlertCenter seed={alerts} />
    </AppShell>
  );
}
