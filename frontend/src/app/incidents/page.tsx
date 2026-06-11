import { AppShell } from "@/components/layout/app-shell";
import { IncidentBoard } from "@/components/security/incident-board";
import { PageIntro } from "@/components/security/section";
import { getIncidents } from "@/lib/api/server";

export const metadata = { title: "Incident Response" };
export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const { incidents } = await getIncidents(9);
  return (
    <AppShell title="Incident Response Center" subtitle="Investigate · contain · resolve">
      <PageIntro
        eyebrow="SOAR"
        title="Incident Response"
        description="Coordinated investigation with auto-generated timelines, automated containment playbooks and full audit trails."
      />
      <IncidentBoard incidents={incidents} />
    </AppShell>
  );
}
