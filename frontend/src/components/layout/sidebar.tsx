"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { BrandMark } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { useRealtime } from "@/lib/realtime/store";

export function Sidebar() {
  const pathname = usePathname();
  const { connected, source } = useRealtime();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-edge/60 bg-carbon/80 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center border-b border-edge/60 px-5">
        <Link href="/" className="focus-ring rounded-lg">
          <BrandMark />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV.map((section) => (
          <div key={section.title}>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/70">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("nav-item focus-ring", active && "nav-item-active")}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge === "live" && (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neuron/60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-neuron" />
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-edge/60 p-4">
        <div className="glass flex items-center gap-3 p-3">
          <span className={cn("relative flex h-2.5 w-2.5", connected ? "" : "opacity-40")}>
            <span className={cn("absolute inline-flex h-full w-full rounded-full", connected ? "animate-ping bg-threat-safe/60" : "bg-muted")} />
            <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", connected ? "bg-threat-safe" : "bg-muted")} />
          </span>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-white">
              {connected ? "Live Stream Active" : "Stream Offline"}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted">
              {source === "websocket" ? "AI Gateway · WS" : source === "simulation" ? "Edge Simulation" : "Disconnected"}
            </div>
          </div>
        </div>
        <p className="mt-3 px-1 text-[10px] text-muted/60">
          v2.0.0 · © Abdulaziz AlAmawi
        </p>
      </div>
    </aside>
  );
}
