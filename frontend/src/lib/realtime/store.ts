"use client";

import { create } from "zustand";
import type { ThreatEvent, SecurityAlert } from "@/lib/types";

interface RealtimeState {
  connected: boolean;
  source: "websocket" | "simulation" | "offline";
  liveEvents: ThreatEvent[];
  liveAlerts: SecurityAlert[];
  eventsPerMin: number;
  blockedCount: number;
  setConnection: (connected: boolean, source: RealtimeState["source"]) => void;
  pushEvent: (e: ThreatEvent) => void;
  pushAlert: (a: SecurityAlert) => void;
  bump: (delta: { blocked?: number; epm?: number }) => void;
}

export const useRealtime = create<RealtimeState>((set) => ({
  connected: false,
  source: "offline",
  liveEvents: [],
  liveAlerts: [],
  eventsPerMin: 0,
  blockedCount: 0,
  setConnection: (connected, source) => set({ connected, source }),
  pushEvent: (e) =>
    set((s) => ({
      liveEvents: [e, ...s.liveEvents].slice(0, 60),
      blockedCount: s.blockedCount + (e.decision === "block" ? 1 : 0),
    })),
  pushAlert: (a) => set((s) => ({ liveAlerts: [a, ...s.liveAlerts].slice(0, 40) })),
  bump: ({ blocked = 0, epm }) =>
    set((s) => ({
      blockedCount: s.blockedCount + blocked,
      eventsPerMin: epm ?? s.eventsPerMin,
    })),
}));
