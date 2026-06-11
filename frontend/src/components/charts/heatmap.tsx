import { cn } from "@/lib/utils";

/** Risk heatmap: rows x cols grid of 0..100 intensities. */
export function Heatmap({
  matrix,
  rowLabels,
  colLabels,
  className,
}: {
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  className?: string;
}) {
  const color = (v: number) => {
    // teal (safe) -> amber -> red (hot)
    if (v < 20) return `rgba(30,224,138,${0.12 + v / 200})`;
    if (v < 45) return `rgba(58,160,255,${0.18 + v / 220})`;
    if (v < 65) return `rgba(255,176,32,${0.25 + v / 260})`;
    if (v < 82) return `rgba(255,122,24,${0.3 + v / 300})`;
    return `rgba(255,45,85,${0.4 + v / 320})`;
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${colLabels.length}, minmax(14px, 1fr))` }}>
        <div />
        {colLabels.map((c, i) => (
          <div key={i} className="text-center text-[9px] text-muted">{c}</div>
        ))}
        {matrix.map((row, r) => (
          <ContentRow key={r} label={rowLabels[r]} row={row} color={color} />
        ))}
      </div>
    </div>
  );
}

function ContentRow({ label, row, color }: { label: string; row: number[]; color: (v: number) => string }) {
  return (
    <>
      <div className="pr-2 text-right text-[9px] leading-[18px] text-muted">{label}</div>
      {row.map((v, i) => (
        <div
          key={i}
          title={`${label} · ${v}`}
          className="h-[18px] rounded-[3px] transition-transform hover:scale-110 hover:ring-1 hover:ring-white/40"
          style={{ background: color(v) }}
        />
      ))}
    </>
  );
}
