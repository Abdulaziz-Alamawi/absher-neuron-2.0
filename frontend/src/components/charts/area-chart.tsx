import type { MetricPoint } from "@/lib/types";

interface Props {
  data: MetricPoint[];
  color?: string;
  height?: number;
  fill?: boolean;
  id: string;
}

export function AreaChart({ data, color = "#1ee0c5", height = 64, fill = true, id }: Props) {
  if (!data.length) return <div style={{ height }} />;
  const w = 100;
  const h = 100;
  const vals = data.map((d) => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = i * step;
    const y = h - ((d.v - min) / range) * (h - 8) - 4;
    return [x, y] as const;
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height, width: "100%" }} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#grad-${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="1.6" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
