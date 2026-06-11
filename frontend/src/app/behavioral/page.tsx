import { AppShell } from "@/components/layout/app-shell";
import { BehavioralLab } from "@/components/security/behavioral-lab";
import { PageIntro } from "@/components/security/section";

export const metadata = { title: "Behavioral Identity" };

export default function BehavioralPage() {
  return (
    <AppShell title="Behavioral Identity Engine" subtitle="Continuous, passive biometric authentication">
      <PageIntro
        eyebrow="AI Behavioral Identity Engine"
        title="Behavioral Identity Profile"
        description="Keystroke dynamics, pointer biometrics, device & network fingerprints fuse into a continuous trust signal — authenticating who you are by how you behave, not just what you know."
      />
      <BehavioralLab />
    </AppShell>
  );
}
