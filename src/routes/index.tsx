import { createFileRoute, redirect } from "@tanstack/react-router";
import { HeroSection } from "@/components/hero-section";
import { StatsSection } from "@/components/stats-section";
import { PatientFeatures } from "@/components/patient-features";
import { ProviderFeatures } from "@/components/provider-features";
import { TrustIndicators } from "@/components/trust-indicators";
import { CTASection } from "@/components/cta-section";
import { getSessionData, getUserId } from "@/lib/auth-server-fn";

export const Route = createFileRoute("/")({
  component: App,
  beforeLoad: async () => {
    const userId = await getUserId();
    return {
      userId,
    };
  },

  loader: async ({ context }) => {
    if (context.userId) {
      const sessionData = await getSessionData();
      if (sessionData.createdUserId && sessionData.state && sessionData.state !== "success") {
        throw redirect({ to: "/auth/sign-up/user-data" });
      }
      throw redirect({ to: "/dashboard" });
    }
  },
});

function App() {
  return (
    <main className="h-full p-10 bg-linear-to-tr from-slate-100 via-blue-50 to-green-50 dark:from-slate-950 dark:via-blue-950 dark:to-green-950">
      <HeroSection />
      <StatsSection />
      <PatientFeatures />
      <ProviderFeatures />
      <TrustIndicators />
      <CTASection />
    </main>
  );
}
