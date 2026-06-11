import { cn } from "@/lib/utils";

export function NeuronLogo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={cn("shrink-0", className)}>
      <defs>
        <linearGradient id="neuron-g" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#1ee0c5" />
          <stop offset="100%" stopColor="#3aa0ff" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 6 11v12c0 11 7.7 18.6 18 22 10.3-3.4 18-11 18-22V11L24 3Z"
        fill="rgba(30,224,197,0.08)"
        stroke="url(#neuron-g)"
        strokeWidth="1.6"
      />
      <circle cx="24" cy="20" r="3.4" fill="url(#neuron-g)" />
      <circle cx="15" cy="28" r="2.2" fill="#1ee0c5" />
      <circle cx="33" cy="28" r="2.2" fill="#3aa0ff" />
      <circle cx="24" cy="33" r="2" fill="#1ee0c5" />
      <path d="M24 20 15 28M24 20l9 8M24 20v13M15 28l9 5M33 28l-9 5" stroke="url(#neuron-g)" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}

export function BrandMark({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <NeuronLogo />
      {!collapsed && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-white">
            Absher <span className="text-neuron">Neuron</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
            Security Intelligence
          </div>
        </div>
      )}
    </div>
  );
}
