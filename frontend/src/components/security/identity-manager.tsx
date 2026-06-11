"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/table";
import { ScoreRing } from "@/components/charts/score-ring";
import { trustColor, scoreColor, timeAgo, cn } from "@/lib/utils";
import type { ManagedUser, VerificationRecord } from "@/lib/types";
import {
  UsersRound, Smartphone, MapPin, ShieldCheck, History, Laptop, Tablet, KeyRound, ScanFace, Mic, Camera, PhoneCall,
} from "lucide-react";

const STATUS_TONE: Record<string, "danger" | "warn" | "ok" | "neutral"> = {
  active: "ok", locked: "danger", suspended: "danger", monitoring: "warn",
};

const DEVICES = [
  { icon: Smartphone, name: "iPhone 15 Pro", os: "iOS 18.2", trusted: true, last: "12m ago" },
  { icon: Laptop, name: "MacBook Pro 14", os: "macOS 15", trusted: true, last: "2h ago" },
  { icon: Tablet, name: "iPad Air", os: "iPadOS 18", trusted: false, last: "3d ago" },
];

const LOCATIONS = [
  { city: "Riyadh, SA", trusted: true, count: 412 },
  { city: "Jeddah, SA", trusted: true, count: 38 },
  { city: "Dubai, AE", trusted: false, count: 2 },
];

const VERIF_ICON: Record<string, typeof KeyRound> = {
  otp: KeyRound, face: ScanFace, voice: Mic, live_camera: Camera, phone_call: PhoneCall,
};

export function IdentityManager({ users, verifications }: { users: ManagedUser[]; verifications: VerificationRecord[] }) {
  const [id, setId] = useState(users[0]?.id);
  const user = users.find((u) => u.id === id) ?? users[0];

  const columns: Column<ManagedUser>[] = [
    {
      key: "user", header: "Identity", render: (u) => (
        <button onClick={() => setId(u.id)} className="text-left">
          <div className="font-medium text-white hover:text-neuron">{u.name}</div>
          <div className="text-xs text-muted">{u.nationalIdMasked} · {u.department}</div>
        </button>
      ),
    },
    { key: "role", header: "Role", render: (u) => <Badge tone="neutral">{u.role}</Badge> },
    {
      key: "trust", header: "Trust", align: "right", render: (u) => (
        <span className="tnum font-bold" style={{ color: trustColor(u.trustScore) }}>{u.trustScore}</span>
      ),
    },
    {
      key: "risk", header: "Risk", align: "right", render: (u) => (
        <span className="tnum font-bold" style={{ color: scoreColor(u.riskScore) }}>{u.riskScore}</span>
      ),
    },
    { key: "mfa", header: "MFA", align: "center", render: (u) => u.mfaEnabled ? <Badge tone="ok">on</Badge> : <Badge tone="danger">off</Badge> },
    { key: "status", header: "Status", render: (u) => <Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge> },
    { key: "last", header: "Last Login", align: "right", render: (u) => <span className="text-xs text-muted">{timeAgo(u.lastLogin)}</span> },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader title="Managed Identities" subtitle={`${users.length} identities under protection`} icon={<UsersRound className="h-4 w-4" />} />
        <CardBody className="p-0"><DataTable columns={columns} rows={users} /></CardBody>
      </Card>

      <div className="space-y-6">
        {user && (
          <Card>
            <CardHeader title="Identity Profile" subtitle={user.nationalIdMasked} icon={<ShieldCheck className="h-4 w-4" />} />
            <CardBody className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-neuron to-threat-low text-lg font-bold text-abyss">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <div className="text-base font-bold text-white">{user.name}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                  <Badge tone={STATUS_TONE[user.status]} className="mt-1">{user.status}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-around rounded-xl border border-edge/60 bg-panel-2/40 p-3">
                <ScoreRing value={user.trustScore} label="Trust" size={92} color={trustColor(user.trustScore)} />
                <ScoreRing value={user.riskScore} label="Risk" size={92} color={scoreColor(user.riskScore)} />
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader title="Trusted Devices" icon={<Smartphone className="h-4 w-4" />} />
          <CardBody className="space-y-2">
            {DEVICES.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.name} className="flex items-center gap-3 rounded-lg border border-edge/50 bg-panel-2/30 p-3">
                  <Icon className="h-5 w-5 text-neuron" />
                  <div className="flex-1">
                    <div className="text-sm text-white">{d.name}</div>
                    <div className="text-[10px] text-muted">{d.os} · {d.last}</div>
                  </div>
                  <Badge tone={d.trusted ? "ok" : "warn"}>{d.trusted ? "trusted" : "review"}</Badge>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Trusted Locations" icon={<MapPin className="h-4 w-4" />} />
        <CardBody className="space-y-2">
          {LOCATIONS.map((l) => (
            <div key={l.city} className="flex items-center gap-3 rounded-lg border border-edge/50 bg-panel-2/30 p-3">
              <MapPin className={cn("h-4 w-4", l.trusted ? "text-threat-safe" : "text-threat-medium")} />
              <span className="flex-1 text-sm text-white">{l.city}</span>
              <span className="tnum text-xs text-muted">{l.count} logins</span>
              <Badge tone={l.trusted ? "ok" : "warn"}>{l.trusted ? "trusted" : "new"}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader title="Verification & Login History" icon={<History className="h-4 w-4" />} />
        <CardBody className="space-y-2">
          {verifications.slice(0, 8).map((v) => {
            const Icon = VERIF_ICON[v.method] ?? KeyRound;
            return (
              <div key={v.id} className="flex items-center gap-3 rounded-lg border border-edge/50 bg-panel-2/30 p-3">
                <Icon className="h-4 w-4 text-neuron" />
                <span className="flex-1 text-sm capitalize text-white">{v.method.replace("_", " ")}</span>
                <span className="tnum text-xs" style={{ color: scoreColor(100 - v.score) }}>{v.score}</span>
                <Badge tone={v.status === "passed" ? "ok" : v.status === "failed" ? "danger" : "warn"}>{v.status}</Badge>
                <span className="w-16 text-right text-[10px] text-muted">{timeAgo(v.at)}</span>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
