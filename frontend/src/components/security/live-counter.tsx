"use client";

import { useRealtime } from "@/lib/realtime/store";
import { StatCard } from "@/components/security/stat-card";
import type { MetricPoint } from "@/lib/types";

export function LiveBlockedCounter({ base, spark }: { base: number; spark: MetricPoint[] }) {
  const blocked = useRealtime((s) => s.blockedCount);
  return (
    <StatCard
      id="k2"
      label="Threats Blocked Today"
      value={base + blocked}
      delta={8.1}
      icon={<span className="text-sm font-bold">⛨</span>}
      sparkColor="#ff2d55"
      spark={spark}
    />
  );
}
