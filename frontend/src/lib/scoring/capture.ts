/**
 * Absher Neuron 2.0 — Live Behavioral Capture
 * Author: Abdulaziz AlAmawi
 *
 * Client-side collectors for keystroke dynamics, pointer dynamics and a
 * privacy-respecting device/browser fingerprint. All capture is local;
 * only derived feature vectors leave the browser.
 */

import type { BehavioralSignals, DeviceFingerprint } from "@/lib/types";

export class KeystrokeCollector {
  private downTimes = new Map<string, number>();
  private holdTimes: number[] = [];
  private flightTimes: number[] = [];
  private lastUp = 0;
  private chars = 0;
  private startedAt = Date.now();

  onKeyDown(key: string) {
    const now = performance.now();
    this.downTimes.set(key, now);
    if (this.lastUp) this.flightTimes.push(now - this.lastUp);
  }

  onKeyUp(key: string) {
    const now = performance.now();
    const down = this.downTimes.get(key);
    if (down != null) {
      this.holdTimes.push(now - down);
      this.downTimes.delete(key);
    }
    this.lastUp = now;
    if (key.length === 1) this.chars += 1;
  }

  private static mean(a: number[]) {
    return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  }
  private static variance(a: number[]) {
    if (a.length < 2) return 0;
    const m = KeystrokeCollector.mean(a);
    return a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length;
  }

  snapshot() {
    const elapsedMin = (Date.now() - this.startedAt) / 60000 || 1 / 60000;
    const cpm = this.chars / elapsedMin;
    const flightMean = KeystrokeCollector.mean(this.flightTimes);
    const rhythmVar = flightMean
      ? Math.min(1, Math.sqrt(KeystrokeCollector.variance(this.flightTimes)) / flightMean)
      : 0;
    return {
      typingSpeedCpm: Math.round(cpm),
      typingRhythmVariance: Number(rhythmVar.toFixed(3)),
      keyHoldMs: Math.round(KeystrokeCollector.mean(this.holdTimes)),
      flightTimeMs: Math.round(flightMean),
    };
  }
}

export class PointerCollector {
  private lastX = 0;
  private lastY = 0;
  private lastT = 0;
  private velocities: number[] = [];
  private angles: number[] = [];
  private moves = 0;
  private idleMs = 0;
  private startedAt = Date.now();

  onMove(x: number, y: number) {
    const now = performance.now();
    if (this.lastT) {
      const dt = (now - this.lastT) / 1000;
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      const dist = Math.hypot(dx, dy);
      if (dt > 0) this.velocities.push(dist / dt);
      if (dt > 0.4) this.idleMs += (now - this.lastT);
      this.angles.push(Math.atan2(dy, dx));
    }
    this.lastX = x;
    this.lastY = y;
    this.lastT = now;
    this.moves += 1;
  }

  snapshot() {
    const mean = this.velocities.length
      ? this.velocities.reduce((a, b) => a + b, 0) / this.velocities.length
      : 0;
    // jitter = normalized direction-change entropy
    let turns = 0;
    for (let i = 1; i < this.angles.length; i++) {
      if (Math.abs(this.angles[i] - this.angles[i - 1]) > Math.PI / 4) turns++;
    }
    const jitter = this.angles.length ? Math.min(1, turns / this.angles.length) : 0;
    const elapsed = Date.now() - this.startedAt || 1;
    return {
      mouseVelocity: Math.round(mean),
      mouseJitter: Number(jitter.toFixed(3)),
      mouseIdleRatio: Number(Math.min(1, this.idleMs / elapsed).toFixed(3)),
      interactionCount: this.moves,
    };
  }
}

async function hashString(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .slice(0, 8)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

function canvasSignature(): string {
  try {
    const c = document.createElement("canvas");
    c.width = 240;
    c.height = 60;
    const ctx = c.getContext("2d");
    if (!ctx) return "n/a";
    ctx.textBaseline = "top";
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = "#1ee0c5";
    ctx.fillRect(10, 10, 120, 30);
    ctx.fillStyle = "#062";
    ctx.fillText("Absher·Neuron·2.0", 14, 14);
    return c.toDataURL();
  } catch {
    return "blocked";
  }
}

function webglSignature(): string {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "n/a";
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return `${vendor}~${renderer}`;
  } catch {
    return "blocked";
  }
}

export async function collectFingerprint(): Promise<DeviceFingerprint> {
  const nav = typeof navigator !== "undefined" ? navigator : ({} as Navigator);
  const ua = nav.userAgent || "unknown";
  const platform = (nav as Navigator & { platform?: string }).platform || "unknown";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const screenStr =
    typeof screen !== "undefined" ? `${screen.width}x${screen.height}x${screen.colorDepth}` : "0x0";
  const webgl = webglSignature();
  const canvas = canvasSignature();

  const [canvasHash, webglHash, audioHash] = await Promise.all([
    hashString(canvas),
    hashString(webgl),
    hashString(ua + tz + screenStr),
  ]);

  const browser = detectBrowser(ua);
  const id = await hashString([ua, platform, tz, screenStr, webgl, canvas.slice(0, 64)].join("|"));

  return {
    id: `dev_${id}`,
    platform,
    browser: browser.name,
    browserVersion: browser.version,
    os: detectOs(ua),
    screen: screenStr,
    timezone: tz,
    language: nav.language || "en",
    cpuCores: (nav as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency || 0,
    deviceMemoryGb: (nav as Navigator & { deviceMemory?: number }).deviceMemory || 0,
    gpu: webgl.slice(0, 48),
    canvasHash,
    webglHash,
    audioHash,
    touchSupport: typeof window !== "undefined" && "ontouchstart" in window,
    trusted: false,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  };
}

function detectBrowser(ua: string): { name: string; version: string } {
  const tests: [string, RegExp][] = [
    ["Edge", /Edg\/([\d.]+)/],
    ["Chrome", /Chrome\/([\d.]+)/],
    ["Firefox", /Firefox\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/],
  ];
  for (const [name, re] of tests) {
    const m = ua.match(re);
    if (m) return { name, version: m[1] };
  }
  return { name: "Unknown", version: "0" };
}

function detectOs(ua: string): string {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad/.test(ua)) return "iOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

/** Merge keystroke + pointer snapshots into a single signal vector. */
export function buildSignals(
  ks: ReturnType<KeystrokeCollector["snapshot"]>,
  ptr: ReturnType<PointerCollector["snapshot"]>,
): BehavioralSignals {
  return {
    typingSpeedCpm: ks.typingSpeedCpm,
    typingRhythmVariance: ks.typingRhythmVariance,
    keyHoldMs: ks.keyHoldMs,
    flightTimeMs: ks.flightTimeMs,
    mouseVelocity: ptr.mouseVelocity,
    mouseJitter: ptr.mouseJitter,
    mouseIdleRatio: ptr.mouseIdleRatio,
    scrollEntropy: 0,
    interactionCount: ptr.interactionCount,
  };
}
