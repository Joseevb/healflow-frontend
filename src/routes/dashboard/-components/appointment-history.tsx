import { Calendar, ChevronRight, Clock } from "lucide-react";
import { SpecialistImage } from "./specialist-image";
import type { AppointmentResponse } from "@/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AppointmentHistoryProps {
  appointmentHistory: Array<AppointmentResponse>;
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

export default function AppointmentHistory({
  appointmentHistory,
}: Readonly<Omit<AppointmentHistoryProps, "statusColors">>) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-linear-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Appointment History
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your past appointments and medical visit records
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          Export Records
        </Button>
      </div>

      {appointmentHistory.length === 0 ? (
        <Card className="border-0 shadow-md dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
              <Calendar className="size-8 text-slate-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No appointment history</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Your completed and past appointments will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md overflow-hidden dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 border-b border-slate-200 dark:border-slate-700/50 pb-4">
            <CardTitle className="text-base font-semibold text-slate-700 dark:text-slate-300">
              {appointmentHistory.length} Past Appointment
              {appointmentHistory.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-700/50">
            {appointmentHistory.map((appointment) => (
              <div
                key={appointment.id}
                className="group flex items-center justify-between gap-4 p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl transition-all duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 group-hover:scale-105">
                    <SpecialistImage
                      profilePictureName={appointment.specialist.profile_picture_name}
                      name={appointment.specialist.name}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                      {appointment.specialist.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {appointment.specialist.specialty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <Calendar className="size-4 text-slate-400" />
                    <span>
                      {new Date(appointment.appointment_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <Clock className="size-4 text-slate-400" />
                    <span>
                      {new Date(appointment.appointment_date).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <Badge variant={statusVariants[appointment.status]}>
                    {appointment.status.charAt(0) +
                      appointment.status.slice(1).toLowerCase().replace("_", " ")}
                  </Badge>

                  <ChevronRight className="size-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
