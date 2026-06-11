import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/table";
import { PageIntro } from "@/components/security/section";
import { getAuditLogs } from "@/lib/api/server";
import { timeAgo } from "@/lib/utils";
import type { AuditLog } from "@/lib/types";
import { ScrollText, Download, ShieldCheck } from "lucide-react";

export const metadata = { title: "Audit Logs" };
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const { logs } = await getAuditLogs(48);

  const columns: Column<AuditLog>[] = [
    { key: "time", header: "Timestamp", render: (l) => <span className="tnum text-xs text-muted">{timeAgo(l.at)}</span> },
    {
      key: "actor", header: "Actor", render: (l) => (
        <div><div className="font-medium text-white">{l.actor}</div><div className="text-[10px] uppercase text-muted">{l.role}</div></div>
      ),
    },
    { key: "action", header: "Action", render: (l) => <span className="text-white">{l.action}</span> },
    { key: "target", header: "Target", render: (l) => <span className="font-mono text-xs text-threat-low">{l.target}</span> },
    { key: "ip", header: "Source IP", render: (l) => <span className="font-mono text-xs text-muted">{l.ip}</span> },
    {
      key: "outcome", header: "Outcome", align: "right", render: (l) => (
        <Badge tone={l.outcome === "success" ? "ok" : l.outcome === "denied" ? "danger" : "warn"}>{l.outcome}</Badge>
      ),
    },
  ];

  return (
    <AppShell title="Audit Trail" subtitle="Immutable, tamper-evident activity ledger">
      <PageIntro
        eyebrow="Accountability"
        title="Audit Logs"
        description="Every privileged action is cryptographically chained and retained for compliance and forensic review."
        actions={
          <button className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-edge bg-panel-2/60 px-3 py-2 text-sm text-muted transition hover:text-white">
            <Download className="h-4 w-4" /> Export
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Events (24h)", value: "12,847" },
          { label: "Denied Actions", value: "23" },
          { label: "Privileged Ops", value: "412" },
          { label: "Retention", value: "365d" },
        ].map((s) => (
          <Card key={s.label}><CardBody><div className="stat-label">{s.label}</div><div className="tnum mt-1 text-2xl font-bold text-white">{s.value}</div></CardBody></Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Activity Ledger"
          subtitle="Hash-chained · WORM storage"
          icon={<ScrollText className="h-4 w-4" />}
          action={<Badge tone="ok"><ShieldCheck className="h-3 w-3" /> integrity verified</Badge>}
        />
        <CardBody className="p-0"><DataTable columns={columns} rows={logs} /></CardBody>
      </Card>
    </AppShell>
  );
}
