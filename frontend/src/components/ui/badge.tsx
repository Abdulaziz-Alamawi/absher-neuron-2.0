import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types";

const severityStyles: Record<string, string> = {
  critical: "border-threat-critical/40 bg-threat-critical/10 text-threat-critical",
  high: "border-threat-high/40 bg-threat-high/10 text-threat-high",
  medium: "border-threat-medium/40 bg-threat-medium/10 text-threat-medium",
  low: "border-threat-low/40 bg-threat-low/10 text-threat-low",
  info: "border-muted/40 bg-muted/10 text-muted",
  safe: "border-threat-safe/40 bg-threat-safe/10 text-threat-safe",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cn("chip", severityStyles[severity], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "neuron" | "danger" | "warn" | "ok";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-edge bg-panel-2/60 text-muted",
    neuron: "border-neuron/40 bg-neuron/10 text-neuron",
    danger: "border-threat-critical/40 bg-threat-critical/10 text-threat-critical",
    warn: "border-threat-medium/40 bg-threat-medium/10 text-threat-medium",
    ok: "border-threat-safe/40 bg-threat-safe/10 text-threat-safe",
  };
  return <span className={cn("chip", tones[tone], className)}>{children}</span>;
}
