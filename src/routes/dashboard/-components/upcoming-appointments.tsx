import { ArrowRight, Calendar, Clock } from "lucide-react";
import { SpecialistImage } from "./specialist-image";
import type { AppointmentResponse } from "@/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UpcomingAppointmentsProps {
  upcomingAppointments: Array<AppointmentResponse>;
  statusColors: Record<AppointmentResponse["status"], string>;
}

const statusVariants: Record<
  AppointmentResponse["status"],
  "success" | "warning" | "info" | "error" | "secondary"
> = {
  CONFIRMED: "success",
  PENDING: "warning",
  COMPLETED: "info",
  CANCELLED: "error",
  NO_SHOW: "secondary",
};

export default function UpcomingAppointments({
  upcomingAppointments,
}: Readonly<Omit<UpcomingAppointmentsProps, "statusColors">>) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
            Upcoming Appointments
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            You have{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {upcomingAppointments.length}
            </span>{" "}
            upcoming appointment
            {upcomingAppointments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {upcomingAppointments.length === 0 ? (
        <Card className="border-0 shadow-md dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
              <Calendar className="size-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No upcoming appointments</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              You don't have any scheduled appointments. Book one to get started with your
              healthcare journey.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="group overflow-hidden border-0 shadow-md hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 dark:bg-slate-800 dark:border-slate-700"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl transition-transform duration-300 group-hover:scale-110">
                      <SpecialistImage
                        profilePictureName={appointment.specialist.profile_picture_name}
                        name={appointment.specialist.name}
                      />{" "}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold">
                        {appointment.specialist.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                        {appointment.specialist.specialty}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={statusVariants[appointment.status]}>
                    {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <Calendar className="size-4 text-blue-600" />
                    <span>
                      {new Date(appointment.appointment_date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <Clock className="size-4 text-green-600" />
                    <span>
                      {new Date(appointment.appointment_date).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 dark:group-hover:bg-blue-900/20 dark:group-hover:border-blue-700 dark:group-hover:text-blue-300 transition-all duration-200"
                >
                  <span className="flex items-center justify-center gap-2">
                    View Details
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
