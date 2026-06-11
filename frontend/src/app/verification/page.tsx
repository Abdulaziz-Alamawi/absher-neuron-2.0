import { AppShell } from "@/components/layout/app-shell";
import { VerificationCenter } from "@/components/security/verification-center";
import { PageIntro } from "@/components/security/section";

export const metadata = { title: "Verification Center" };

export default function VerificationPage() {
  return (
    <AppShell title="Triple Verification System" subtitle="Adaptive, risk-based multi-factor identity proofing">
      <PageIntro
        eyebrow="Adaptive MFA"
        title="Verification Center"
        description="Face, live-camera liveness, voiceprint, automated phone callback and OTP — orchestrated by the risk engine so stronger proofs are demanded only when risk warrants it."
      />
      <VerificationCenter />
    </AppShell>
  );
}
