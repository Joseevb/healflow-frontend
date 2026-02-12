import { Award, Heart, TrendingUp } from "lucide-react";
import { H2, H3, Paragraph } from "@/components/ui/typography";

export function TrustIndicators() {
  return (
    <section className="py-20 bg-linear-to-r from-slate-500 via-slate-600 to-slate-700 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 text-white -mx-10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <H2 className="text-4xl font-bold mb-4 text-white border-none pb-0">
            Trusted by Healthcare Leaders
          </H2>
          <Paragraph className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of healthcare providers and patients who trust our platform
          </Paragraph>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="p-4 bg-white/10 rounded-full w-fit mx-auto mb-4">
              <Award className="h-8 w-8" />
            </div>
            <H3 className="text-white mb-2">HIPAA Compliant</H3>
            <Paragraph className="text-blue-100">
              Fully compliant with healthcare privacy regulations and security standards
            </Paragraph>
          </div>

          <div className="text-center">
            <div className="p-4 bg-white/10 rounded-full w-fit mx-auto mb-4">
              <TrendingUp className="h-8 w-8" />
            </div>
            <H3 className="text-white mb-2">99.9% Uptime</H3>
            <Paragraph className="text-blue-100">
              Reliable platform with enterprise-grade infrastructure and 24/7 monitoring
            </Paragraph>
          </div>

          <div className="text-center">
            <div className="p-4 bg-white/10 rounded-full w-fit mx-auto mb-4">
              <Heart className="h-8 w-8" />
            </div>
            <H3 className="text-white mb-2">Patient-Centered</H3>
            <Paragraph className="text-blue-100">
              Designed with patient experience and outcomes as our top priority
            </Paragraph>
          </div>
        </div>
      </div>
    </section>
  );
}
