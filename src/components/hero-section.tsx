import { Activity, ArrowRight, Calendar, FileText, Hospital, Pill } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { H1, Paragraph } from "@/components/ui/typography";
import { useSession } from "@/lib/auth-client";

export function HeroSection() {
  const { data: session } = useSession();
  const isAuthenticated = session !== null;

  return (
    <section className="relative overflow-hidden  py-20 lg:py-32 -mx-10 -mt-10 mb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                <Hospital className="h-4 w-4" />
                Modern Healthcare Management
              </div>
              <H1 className="text-left text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Your Health,{" "}
                <span className="bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Simplified
                </span>
              </H1>
              <Paragraph className="text-xl text-gray-600 dark:text-slate-300 leading-relaxed">
                Streamline your healthcare experience with Healflow&lsquo;s comprehensive platform.
                Book appointments, manage medical records, and connect with healthcare providers all
                in one secure place.
              </Paragraph>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link to="/auth" className="flex items-center gap-2">
                      Get Started <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                    <a href="#features">Learn More</a>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      Go to Dashboard <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                    <Link to="/dashboard/appointments" className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Book Appointment
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg transition-colors duration-300">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Next Appointment</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">Dr. Smith</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Tomorrow, 2:30 PM</div>
                </CardContent>
              </Card>

              <Card className="hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg transition-colors duration-300">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Health Score</div>
                      <div className="text-2xl font-bold text-green-600">92/100</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg transition-colors duration-300">
                      <Pill className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Medications</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">3 active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg transition-colors duration-300">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Records</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">Up to date</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
