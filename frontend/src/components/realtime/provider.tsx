"use client";

import { useEffect, useRef } from "react";
import { useRealtime } from "@/lib/realtime/store";
import { syntheticEvent, eventToAlert } from "@/lib/realtime/simulator";
import type { ThreatEvent } from "@/lib/types";

const WS_URL = process.env.NEXT_PUBLIC_AI_WS_URL || "ws://localhost:8000/ws/stream";

/**
 * Connects to the AI engine WebSocket gateway for the live security stream.
 * If the gateway is unreachable, it transparently falls back to an in-browser
 * simulation so the command center is never empty.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { setConnection, pushEvent, pushAlert, bump } = useRealtime();
  const wsRef = useRef<WebSocket | null>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const startSimulation = () => {
      if (cancelled || simRef.current) return;
      setConnection(true, "simulation");
      let epm = 0;
      simRef.current = setInterval(() => {
        const e = syntheticEvent();
        ingest(e);
        epm = Math.min(240, epm + Math.round(Math.random() * 6));
        bump({ epm });
      }, 2600);
    };

    const ingest = (e: ThreatEvent) => {
      pushEvent(e);
      if (e.severity === "critical" || e.severity === "high") pushAlert(eventToAlert(e));
    };

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      const timeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          try { ws.close(); } catch { /* noop */ }
          startSimulation();
        }
      }, 2500);

      ws.onopen = () => {
        clearTimeout(timeout);
        if (!cancelled) setConnection(true, "websocket");
      };
      ws.onmessage = (msg) => {
        try {
          const e = JSON.parse(msg.data) as ThreatEvent;
          ingest(e);
          bump({ epm: 1 });
        } catch { /* ignore malformed frames */ }
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        startSimulation();
      };
      ws.onclose = () => {
        if (!cancelled && !simRef.current) startSimulation();
      };
    } catch {
      startSimulation();
    }

    return () => {
      cancelled = true;
      if (simRef.current) clearInterval(simRef.current);
      if (wsRef.current) { try { wsRef.current.close(); } catch { /* noop */ } }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
