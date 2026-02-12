import { CalendarCheck, FileText, PieChart, Pill, Stethoscope, UserCheck } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { H2, Paragraph } from "@/components/ui/typography";

export function ProviderFeatures() {
  return (
    <section className="py-20 bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 -mx-10 ">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <H2 className="text-4xl font-bold mb-4 border-none pb-0">For Healthcare Providers</H2>
          <Paragraph className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Streamline your practice with powerful tools designed for modern healthcare delivery
          </Paragraph>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-700 dark:border-slate-600">
            <CardHeader>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <CalendarCheck className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Appointment Management</CardTitle>
              <CardDescription>
                Efficiently manage your schedule, view patient appointments, and optimize your time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-700 dark:border-slate-600">
            <CardHeader>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>
                Access comprehensive patient information, medical history, and treatment plans
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-700 dark:border-slate-600">
            <CardHeader>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Clinical Notes</CardTitle>
              <CardDescription>
                Document patient visits, treatment notes, and clinical observations seamlessly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-700 dark:border-slate-600">
            <CardHeader>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <Pill className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Prescription Writing</CardTitle>
              <CardDescription>
                Create and manage prescriptions with built-in drug interaction checks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-700 dark:border-slate-600">
            <CardHeader>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <PieChart className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Gain insights into your practice with comprehensive analytics and reporting tools
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-md dark:bg-slate-700 dark:border-slate-600">
            <CardHeader>
              <div className="p-3 bg-teal-100 dark:bg-teal-900/20 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Specialist Referrals</CardTitle>
              <CardDescription>
                Easily refer patients to specialists and track referral status and outcomes
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
}
