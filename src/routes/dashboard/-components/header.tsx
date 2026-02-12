import { Calendar } from "lucide-react";
import BookAppointmentDialog from "./book-appointment-dialog";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <Calendar className="size-5 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
            Appointments
          </h1>
          <Badge variant="blue" size="sm">
            Manage
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-md">
          Schedule, view, and manage your upcoming and past appointments with healthcare providers.
        </p>
      </div>
      <BookAppointmentDialog />
    </header>
  );
}
