import Link from "next/link";
import { NeuronLogo } from "@/components/layout/logo";
import { ShieldX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-command flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <NeuronLogo size={64} />
      <div className="mt-6 flex items-center gap-2 text-threat-critical">
        <ShieldX className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-[0.2em]">Access Path Not Found</span>
      </div>
      <h1 className="mt-3 text-6xl font-bold tracking-tight text-white">404</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        This sector of the command center does not exist or has been quarantined.
      </p>
      <Link
        href="/"
        className="focus-ring mt-6 rounded-xl border border-neuron/40 bg-neuron/10 px-5 py-2.5 text-sm font-semibold text-neuron transition hover:bg-neuron/20"
      >
        Return to Command Center
      </Link>
    </div>
  );
}
