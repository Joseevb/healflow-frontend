import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { AlertTriangle, Calendar } from "lucide-react";
import AppointmentHistory from "./-components/appointment-history";
import UpcomingAppointments from "./-components/upcoming-appointments";
import Header from "./-components/header";
import { Separator } from "@/components/ui/separator";
import {
  getPastAppointmentsOptions,
  getUpcomingAppointmentsOptions,
} from "@/client/@tanstack/react-query.gen";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/appointments")({
  component: RouteComponent,
  errorComponent: ({ error }) => (
    <div className="space-y-8">
      <Header />
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="size-12 text-destructive" />
            <h3 className="text-lg font-semibold">Error Loading Appointments</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {error.message || "An unexpected error occurred"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});

function UpcomingAppointmentsLoader() {
  try {
    const { data: upcomingAppointments } = useSuspenseQuery(getUpcomingAppointmentsOptions());
    console.log("Upcoming appointments data:", upcomingAppointments);

    return <UpcomingAppointments upcomingAppointments={upcomingAppointments} />;
  } catch (error) {
    console.error("Error in UpcomingAppointmentsLoader:", error);
    throw error;
  }
}

function AppointmentHistoryLoader() {
  try {
    const { data: appointmentHistory } = useSuspenseQuery(getPastAppointmentsOptions());
    console.log("Past appointments data:", appointmentHistory);

    return <AppointmentHistory appointmentHistory={appointmentHistory} />;
  } catch (error) {
    console.error("Error in AppointmentHistoryLoader:", error);
    throw error;
  }
}

function RouteComponent() {
  const UpcomingLoadingFallback = (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full animate-pulse">
        <Calendar className="size-8 text-blue-600" />
      </div>
      <span className="text-sm text-muted-foreground flex gap-2 items-center">
        <Spinner />
        Loading upcoming appointments...
      </span>
    </div>
  );

  const HistoryLoadingFallback = (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse">
        <Calendar className="size-8 text-slate-500" />
      </div>
      <span className="text-sm text-muted-foreground flex gap-2 items-center">
        <Spinner />
        Loading appointment history...
      </span>
    </div>
  );

  return (
    <div className="space-y-8">
      <Header />

      <Separator variant="gradientBlue" className="my-8" />

      <Suspense fallback={UpcomingLoadingFallback}>
        <UpcomingAppointmentsLoader />
      </Suspense>

      <Separator variant="gradient" className="my-6" />

      <Suspense fallback={HistoryLoadingFallback}>
        <AppointmentHistoryLoader />
      </Suspense>
    </div>
  );
}
