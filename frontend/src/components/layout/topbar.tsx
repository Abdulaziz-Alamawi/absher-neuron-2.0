"use client";

import { Search, Bell, ShieldCheck, ChevronDown } from "lucide-react";
import { useRealtime } from "@/lib/realtime/store";
import { Badge } from "@/components/ui/badge";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { liveAlerts, eventsPerMin } = useRealtime();
  const newAlerts = liveAlerts.filter((a) => a.status === "new").length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-edge/60 bg-carbon/70 px-4 backdrop-blur-xl lg:px-7">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-white lg:text-lg">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>

      <div className="hidden items-center gap-2 rounded-xl border border-edge bg-panel/60 px-3 py-2 md:flex">
        <Search className="h-4 w-4 text-muted" />
        <input
          placeholder="Search identities, threats, incidents…"
          className="w-56 bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
        />
        <kbd className="rounded border border-edge bg-panel-2 px-1.5 text-[10px] text-muted">⌘K</kbd>
      </div>

      <Badge tone="neuron" className="hidden xl:inline-flex">
        <ShieldCheck className="h-3 w-3" /> DEFCON 4
      </Badge>

      <div className="hidden items-center gap-1.5 rounded-lg border border-edge bg-panel/60 px-3 py-1.5 text-xs text-muted sm:flex">
        <span className="tnum font-semibold text-neuron">{eventsPerMin}</span> evt/min
      </div>

      <button className="focus-ring relative rounded-lg border border-edge bg-panel/60 p-2.5 text-muted transition hover:text-white">
        <Bell className="h-[18px] w-[18px]" />
        {newAlerts > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-threat-critical px-1 text-[9px] font-bold text-white">
            {newAlerts > 9 ? "9+" : newAlerts}
          </span>
        )}
      </button>

      <button className="focus-ring flex items-center gap-2 rounded-lg border border-edge bg-panel/60 py-1.5 pl-1.5 pr-2.5 transition hover:border-neuron/40">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-neuron to-threat-low text-[11px] font-bold text-abyss">
          AA
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-xs font-semibold text-white">Abdulaziz AlAmawi</span>
          <span className="block text-[10px] text-muted">Super Admin</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
    </header>
  );
}
