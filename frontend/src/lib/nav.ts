import {
  LayoutDashboard, Radar, Fingerprint, ShieldAlert, Activity,
  Siren, FileSearch, UsersRound, ScrollText, ShieldCheck, Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: "live";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    title: "Operations",
    items: [
      { href: "/", label: "Command Center", icon: LayoutDashboard, badge: "live" },
      { href: "/threats", label: "Threat Intelligence", icon: Radar, badge: "live" },
      { href: "/analytics", label: "Security Analytics", icon: Activity },
    ],
  },
  {
    title: "Identity",
    items: [
      { href: "/behavioral", label: "Behavioral Identity", icon: Fingerprint },
      { href: "/verification", label: "Verification Center", icon: ShieldCheck },
      { href: "/identity", label: "Identity Management", icon: UsersRound },
    ],
  },
  {
    title: "Response",
    items: [
      { href: "/alerts", label: "Alert Center", icon: Siren, badge: "live" },
      { href: "/incidents", label: "Incident Response", icon: ShieldAlert },
      { href: "/investigate", label: "Investigation", icon: FileSearch },
    ],
  },
  {
    title: "Governance",
    items: [
      { href: "/compliance", label: "Compliance & RBAC", icon: ShieldCheck },
      { href: "/audit", label: "Audit Logs", icon: ScrollText },
      { href: "/settings", label: "Policies & Settings", icon: Settings },
    ],
  },
];
