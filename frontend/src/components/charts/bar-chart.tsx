import { cn } from "@/lib/utils";

interface Bar {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({
  data,
  max,
  height = 160,
  className,
}: {
  data: Bar[];
  max?: number;
  height?: number;
  className?: string;
}) {
  const ceiling = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("flex items-end gap-2", className)} style={{ height }}>
      {data.map((d, i) => {
        const h = (d.value / ceiling) * 100;
        return (
          <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1.5">
            <span className="tnum text-[10px] text-muted opacity-0 transition group-hover:opacity-100">{d.value}</span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${h}%`,
                minHeight: 3,
                background: `linear-gradient(180deg, ${d.color ?? "#1ee0c5"}, ${d.color ?? "#1ee0c5"}22)`,
                boxShadow: `0 0 14px -4px ${d.color ?? "#1ee0c5"}`,
              }}
            />
            <span className="truncate text-[9px] uppercase tracking-wider text-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
