import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { RealtimeProvider } from "@/components/realtime/provider";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <RealtimeProvider>
      <div className="relative min-h-screen">
        <Sidebar />
        <div className="lg:pl-[252px]">
          <Topbar title={title} subtitle={subtitle} />
          <main className="relative z-10 mx-auto max-w-[1500px] px-4 py-6 lg:px-7 lg:py-8">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </RealtimeProvider>
  );
}
