interface Axis {
  label: string;
  value: number; // 0..100
}

export function RadarChart({ axes, size = 220, color = "#1ee0c5" }: { axes: Axis[]; size?: number; color?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;
  const n = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, radius: number) => {
    const a = angle(i);
    return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius];
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const poly = axes
    .map((ax, i) => {
      const [x, y] = point(i, (ax.value / 100) * r);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={size} height={size}>
      {rings.map((rr, i) => (
        <polygon
          key={i}
          points={axes.map((_, j) => point(j, r * rr).map((v) => v.toFixed(1)).join(",")).join(" ")}
          fill="none"
          stroke="#1e2840"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, r);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#1e2840" strokeWidth="1" />;
      })}
      <polygon points={poly} fill={`${color}22`} stroke={color} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 6px ${color}55)` }} />
      {axes.map((ax, i) => {
        const [x, y] = point(i, (ax.value / 100) * r);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
      {axes.map((ax, i) => {
        const [x, y] = point(i, r + 16);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-muted" style={{ fontSize: 9 }}>
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}
