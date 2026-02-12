import { Activity, Calendar, FileText, MessageSquare, Pill, Shield } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, Paragraph } from "@/components/ui/typography";

export function PatientFeatures() {
  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-slate-900 -mx-10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <H2 className="text-4xl font-bold mb-4 border-none pb-0">For Patients</H2>
          <Paragraph className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Take control of your healthcare journey with our comprehensive patient platform
          </Paragraph>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Book Appointments</CardTitle>
              <CardDescription>
                Schedule appointments with your preferred doctors and specialists with just a few
                clicks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>
                Access your complete medical records, test results, and treatment history anytime
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Pill className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Prescription Management</CardTitle>
              <CardDescription>
                Track your medications, set reminders, and manage prescription refills
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Health Monitoring</CardTitle>
              <CardDescription>
                Track vital signs, symptoms, and health metrics with integrated monitoring tools
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Secure Messaging</CardTitle>
              <CardDescription>
                Communicate directly with your healthcare providers through secure messaging
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="p-3 bg-teal-100 dark:bg-teal-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Your health data is protected with enterprise-grade security and HIPAA compliance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
