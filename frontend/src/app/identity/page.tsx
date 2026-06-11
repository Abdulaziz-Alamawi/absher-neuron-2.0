import { AppShell } from "@/components/layout/app-shell";
import { IdentityManager } from "@/components/security/identity-manager";
import { PageIntro } from "@/components/security/section";
import { getIdentities, getVerifications } from "@/lib/api/server";

export const metadata = { title: "Identity Management" };
export const dynamic = "force-dynamic";

export default async function IdentityPage() {
  const [{ users }, { verifications }] = await Promise.all([
    getIdentities(28),
    getVerifications(16),
  ]);
  return (
    <AppShell title="Digital Identity Management" subtitle="Profiles · devices · locations · history">
      <PageIntro
        eyebrow="Identity Lifecycle"
        title="Identity Management"
        description="A unified view of every protected digital identity: trusted devices, known locations, verification history and live trust posture."
      />
      <IdentityManager users={users} verifications={verifications} />
    </AppShell>
  );
}
