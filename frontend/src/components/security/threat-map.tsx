"use client";

import { useMemo } from "react";
import { useRealtime } from "@/lib/realtime/store";
import { scoreColor } from "@/lib/utils";
import type { ThreatEvent } from "@/lib/types";

const W = 360;
const H = 180;

function project(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * W,
    y: ((90 - lat) / 180) * H,
  };
}

const SOC = project(24.71, 46.68); // Riyadh operations hub

export function ThreatMap({ seed = [] }: { seed?: ThreatEvent[] }) {
  const live = useRealtime((s) => s.liveEvents);
  const events = useMemo(() => [...live, ...seed].slice(0, 26), [live, seed]);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "transparent" }}>
        {/* dotted grid world canvas */}
        <defs>
          <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="rgba(30,224,197,0.12)" />
          </pattern>
          <radialGradient id="soc-glow">
            <stop offset="0%" stopColor="#1ee0c5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1ee0c5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#dots)" rx="6" />

        {/* attack arcs converging on the SOC */}
        {events.map((e, i) => {
          const p = project(e.geo.lat, e.geo.lng);
          const mx = (p.x + SOC.x) / 2;
          const my = (p.y + SOC.y) / 2 - 30;
          const col = scoreColor(e.riskScore);
          return (
            <g key={e.id + i}>
              <path
                d={`M${p.x},${p.y} Q${mx},${my} ${SOC.x},${SOC.y}`}
                fill="none"
                stroke={col}
                strokeWidth="0.5"
                opacity="0.35"
              />
              <circle cx={p.x} cy={p.y} r="1.8" fill={col}>
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={p.x} cy={p.y} r="3.5" fill="none" stroke={col} strokeWidth="0.4" className="radar-blip" />
            </g>
          );
        })}

        {/* SOC hub */}
        <circle cx={SOC.x} cy={SOC.y} r="14" fill="url(#soc-glow)" />
        <circle cx={SOC.x} cy={SOC.y} r="3" fill="#1ee0c5" />
        <circle cx={SOC.x} cy={SOC.y} r="5" fill="none" stroke="#1ee0c5" strokeWidth="0.6" className="radar-blip" />
        <text x={SOC.x + 7} y={SOC.y + 1} className="fill-neuron" style={{ fontSize: 6, fontWeight: 700 }}>
          RIYADH SOC
        </text>
      </svg>

      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-edge/40" />
    </div>
  );
}
