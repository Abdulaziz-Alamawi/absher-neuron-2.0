"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Radar, Siren, ShieldAlert, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Center", icon: LayoutDashboard },
  { href: "/threats", label: "Threats", icon: Radar },
  { href: "/alerts", label: "Alerts", icon: Siren },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert },
  { href: "/behavioral", label: "Identity", icon: Fingerprint },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-edge/60 bg-carbon/90 backdrop-blur-xl lg:hidden">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
              active ? "text-neuron" : "text-muted",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
