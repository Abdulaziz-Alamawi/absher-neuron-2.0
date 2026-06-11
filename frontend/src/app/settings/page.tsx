import { AppShell } from "@/components/layout/app-shell";
import { PolicySettings } from "@/components/security/policy-settings";
import { PageIntro } from "@/components/security/section";

export const metadata = { title: "Policies & Settings" };

export default function SettingsPage() {
  return (
    <AppShell title="Security Policies" subtitle="Adaptive authentication & engine configuration">
      <PageIntro
        eyebrow="Configuration"
        title="Policies & Settings"
        description="Tune the adaptive authentication engine, AI models, network controls and notification routing."
      />
      <PolicySettings />
    </AppShell>
  );
}
