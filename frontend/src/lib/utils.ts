import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Deterministic seeded PRNG (mulberry32) for stable mock data across renders. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export const severityColor: Record<string, string> = {
  critical: "#ff2d55",
  high: "#ff7a18",
  medium: "#ffb020",
  low: "#3aa0ff",
  info: "#7d8aa8",
  safe: "#1ee08a",
};

export function scoreColor(score: number): string {
  if (score >= 80) return "#ff2d55";
  if (score >= 60) return "#ff7a18";
  if (score >= 40) return "#ffb020";
  if (score >= 20) return "#3aa0ff";
  return "#1ee08a";
}

export function trustColor(score: number): string {
  if (score >= 80) return "#1ee08a";
  if (score >= 60) return "#3aa0ff";
  if (score >= 40) return "#ffb020";
  if (score >= 20) return "#ff7a18";
  return "#ff2d55";
}
