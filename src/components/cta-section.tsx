"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { H2, Paragraph } from "@/components/ui/typography";
import { useSession } from "@/lib/auth-client";

export function CTASection() {
  const { data: session } = useSession();
  const isAuthenticated = session !== null;

  return (
    <section className="py-20 bg-gray-50 dark:bg-slate-900 -mx-10">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <H2 className="text-4xl font-bold mb-6 border-none pb-0">
            Ready to Transform Your Healthcare Experience?
          </H2>
          <Paragraph className="text-xl text-gray-600 dark:text-slate-300 mb-8">
            Join thousands of patients and healthcare providers who have already made the switch to
            smarter healthcare management.
          </Paragraph>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/auth/sign-up" className="flex items-center gap-2">
                    Sign Up Today <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>

          <Paragraph className="text-sm text-gray-500 dark:text-slate-400 mt-6">
            No credit card required • HIPAA compliant • 24/7 support
          </Paragraph>
        </div>
      </div>
    </section>
  );
}
