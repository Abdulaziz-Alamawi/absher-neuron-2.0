import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/charts/score-ring";
import { PageIntro } from "@/components/security/section";
import { ShieldCheck, Check, X, Lock, FileCheck } from "lucide-react";

export const metadata = { title: "Compliance & RBAC" };

const ROLES = ["analyst", "responder", "admin", "auditor", "superadmin"] as const;
const PERMISSIONS = [
  "View dashboards", "Investigate threats", "Acknowledge alerts", "Execute response actions",
  "Lock / unlock identities", "Manage security policies", "Manage users & roles", "Export audit logs",
];
const MATRIX: Record<string, boolean[]> = {
  analyst: [true, true, true, false, false, false, false, false],
  responder: [true, true, true, true, true, false, false, false],
  admin: [true, true, true, true, true, true, true, false],
  auditor: [true, true, false, false, false, false, false, true],
  superadmin: [true, true, true, true, true, true, true, true],
};

const FRAMEWORKS = [
  { name: "NCA ECC", desc: "Essential Cybersecurity Controls", score: 97 },
  { name: "PDPL", desc: "Personal Data Protection Law", score: 95 },
  { name: "ISO 27001", desc: "Information Security Management", score: 93 },
  { name: "NIST CSF", desc: "Cybersecurity Framework 2.0", score: 96 },
  { name: "SOC 2 Type II", desc: "Trust Services Criteria", score: 91 },
  { name: "GDPR", desc: "Data Protection Regulation", score: 94 },
];

export default function CompliancePage() {
  const avg = Math.round(FRAMEWORKS.reduce((a, b) => a + b.score, 0) / FRAMEWORKS.length);
  return (
    <AppShell title="Compliance & Access Governance" subtitle="RBAC · regulatory posture">
      <PageIntro
        eyebrow="Enterprise Governance"
        title="Compliance & RBAC"
        description="Role-based access control matrix and continuous compliance posture across national and international frameworks."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Compliance Posture" subtitle="Aggregate readiness" icon={<ShieldCheck className="h-4 w-4" />} />
          <CardBody className="flex items-center justify-center">
            <ScoreRing value={avg} label="Compliant" sublabel="6 frameworks" color="#1ee08a" size={150} />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Regulatory Frameworks" subtitle="Control coverage" icon={<FileCheck className="h-4 w-4" />} />
          <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FRAMEWORKS.map((f) => (
              <div key={f.name} className="rounded-xl border border-edge/60 bg-panel-2/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{f.name}</span>
                  <span className="tnum text-sm font-bold text-threat-safe">{f.score}%</span>
                </div>
                <div className="text-[10px] text-muted">{f.desc}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-2">
                  <div className="h-full rounded-full bg-threat-safe" style={{ width: `${f.score}%` }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Role-Based Access Control Matrix" subtitle="Least-privilege permission model" icon={<Lock className="h-4 w-4" />} />
        <CardBody className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-edge/60">
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Permission</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p, i) => (
                <tr key={p} className="border-b border-edge/30 hover:bg-panel-2/40">
                  <td className="px-3 py-2.5 text-white">{p}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-3 py-2.5 text-center">
                      {MATRIX[r][i] ? (
                        <Check className="mx-auto h-4 w-4 text-threat-safe" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-edge" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Active Roles", value: "5" },
          { label: "Privileged Accounts", value: "12" },
          { label: "MFA Enforcement", value: "100%" },
          { label: "Policy Violations (30d)", value: "3" },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody>
              <div className="stat-label">{s.label}</div>
              <div className="tnum mt-1 text-2xl font-bold text-white">{s.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="mt-4">
        <Badge tone="ok"><Check className="h-3 w-3" /> All privileged sessions recorded & retained for 365 days</Badge>
      </div>
    </AppShell>
  );
}
