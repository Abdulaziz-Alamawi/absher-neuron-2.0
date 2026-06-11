import { cn, formatCompact } from "@/lib/utils";
import { AreaChart } from "@/components/charts/area-chart";
import type { MetricPoint } from "@/lib/types";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  delta?: number;
  deltaPositiveIsGood?: boolean;
  icon?: React.ReactNode;
  spark?: MetricPoint[];
  sparkColor?: string;
  id: string;
  suffix?: string;
}

export function StatCard({
  label, value, delta, deltaPositiveIsGood = true, icon, spark, sparkColor = "#1ee0c5", id, suffix,
}: Props) {
  const up = (delta ?? 0) >= 0;
  const good = up === deltaPositiveIsGood;
  const display = typeof value === "number" ? formatCompact(value) : value;

  return (
    <div className="glass glass-hover group relative p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="mt-1.5 flex items-baseline gap-1">
            <span className="tnum text-2xl font-bold text-white">{display}</span>
            {suffix && <span className="text-sm text-muted">{suffix}</span>}
          </p>
        </div>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-panel-2/70 text-neuron transition group-hover:shadow-glow">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        {delta != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              good ? "text-threat-safe" : "text-threat-critical",
            )}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        {spark && (
          <div className="flex-1">
            <AreaChart data={spark} id={id} color={sparkColor} height={34} />
          </div>
        )}
      </div>
    </div>
  );
}
