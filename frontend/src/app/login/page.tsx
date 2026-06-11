"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NeuronLogo } from "@/components/layout/logo";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("abdulaziz@absher.sa");
  const [password, setPassword] = useState("neuron2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      localStorage.setItem("neuron_token", data.token);
      localStorage.setItem("neuron_user", JSON.stringify(data.user));
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-command flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <NeuronLogo size={56} />
          <h1 className="mt-4 text-xl font-bold text-white">
            Absher <span className="text-neuron">Neuron</span>
          </h1>
          <p className="mt-1 text-xs text-muted">Secure operator sign-in · Abdulaziz AlAmawi</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="stat-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring mt-1 w-full rounded-xl border border-edge bg-carbon/60 px-4 py-2.5 text-sm text-white"
              required
            />
          </div>
          <div>
            <label className="stat-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring mt-1 w-full rounded-xl border border-edge bg-carbon/60 px-4 py-2.5 text-sm text-white"
              required
            />
          </div>
          {error && <p className="text-sm text-threat-critical">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-neuron py-3 text-sm font-semibold text-abyss transition hover:bg-neuron/90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Authenticate
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-muted">
          Demo: abdulaziz@absher.sa / neuron2026 (superadmin)
        </p>
      </div>
    </div>
  );
}
