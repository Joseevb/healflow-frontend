import {
  QueryErrorResetBoundary,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import { Component, Suspense, useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ErrorInfo, ReactNode } from "react";
import type { ApiProblemDetail, SpecialistResponse } from "@/client";
import {
  createAppointmentMutation,
  getAvailableSpecialistsOptions,
  getPastAppointmentsOptions,
  getSpecialistBookingDataOptions,
  getUpcomingAppointmentsOptions,
} from "@/client/@tanstack/react-query.gen";
import Calendar from "@/components/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldSelect } from "@/components/ui/field-select";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

interface SpecialistSelectProps {
  readonly onSelect: (specialistId: string) => void;
}

interface BookingCalendarProps {
  readonly specialistId: string;
  readonly onSuccess: () => void;
}

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{this.state.error.message || "An error occurred while loading data."}</p>
            <Button variant="outline" size="sm" onClick={this.handleReset} className="w-fit">
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

function useBookAppointmentMutation(onSuccess: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointmentMutation().mutationFn,
    onSuccess: () => {
      toast.success("Appointment created successfully!");
      onSuccess();
      void queryClient.invalidateQueries({
        queryKey: getUpcomingAppointmentsOptions().queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getPastAppointmentsOptions().queryKey,
      });
    },
    onError: (error: unknown) => {
      const apiError = (error as { data?: ApiProblemDetail }).data;
      toast.error(apiError?.detail ?? "Failed to create appointment");
    },
  });
}

function useDateRange() {
  return useMemo(() => {
    const now = new Date();
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }, []);
}

function LoadingSpinner({ message }: { readonly message: string }) {
  return (
    <div className="py-4 flex gap-2 items-center justify-center text-sm text-muted-foreground">
      <Spinner />
      <span>{message}</span>
    </div>
  );
}

function SpecialistSelectContent({ onSelect }: SpecialistSelectProps) {
  const { data: specialists } = useSuspenseQuery(getAvailableSpecialistsOptions());

  const selectData = useMemo(
    () =>
      specialists.map((s: SpecialistResponse) => ({
        value: s.id,
        label: s.name,
      })),
    [specialists],
  );

  const handleSelect = useCallback(
    (item: { value: string; label: string }) => {
      onSelect(item.value);
    },
    [onSelect],
  );

  return (
    <FieldSelect
      data={selectData}
      label="Specialist"
      placeholder="Choose a specialist"
      description="Select your specialist medic of choice"
      action={handleSelect}
    />
  );
}

function SpecialistSelect({ onSelect }: SpecialistSelectProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset}>
          <Suspense fallback={<LoadingSpinner message="Loading specialists..." />}>
            <SpecialistSelectContent onSelect={onSelect} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

function BookingCalendarContent({ specialistId, onSuccess }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const { startDate, endDate } = useDateRange();

  const { data: bookingData } = useSuspenseQuery({
    ...getSpecialistBookingDataOptions({
      path: { specialistId },
      query: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    }),
  });

  const { mutate, isPending } = useBookAppointmentMutation(onSuccess);

  const fullyBookedDates = useMemo(
    () =>
      bookingData
        .filter((day) => day.timeslots.every((slot) => slot.status === "booked"))
        .map((day) => new Date(day.date)),
    [bookingData],
  );

  const timeSlots = useMemo(
    () =>
      bookingData.find((day) => day.date.split("T")[0] === selectedDate.toISOString().split("T")[0])
        ?.timeslots ?? [],
    [bookingData, selectedDate],
  );

  const handleBooking = useCallback(
    (date: Date, time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      const bookingDate = new Date(date);
      bookingDate.setHours(hours, minutes);

      mutate({
        body: {
          appointment_date: bookingDate.toISOString(),
          specialist_id: specialistId,
          notes: notes,
        },
      });
    },
    [mutate, specialistId, notes],
  );

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Add any notes or special requests for your appointment"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Calendar
        bookedDates={fullyBookedDates}
        timeSlots={timeSlots}
        action={handleBooking}
        onSelect={setSelectedDate}
        isLoading={isPending}
      />
    </div>
  );
}

function BookingCalendar({ specialistId, onSuccess }: BookingCalendarProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset}>
          <Suspense fallback={<LoadingSpinner message="Loading availability..." />}>
            <BookingCalendarContent specialistId={specialistId} onSuccess={onSuccess} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export default function BookAppointmentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleSpecialistSelect = useCallback((specialistId: string) => {
    startTransition(() => {
      setSelectedSpecialistId(specialistId);
    });
  }, []);

  const handleBookingSuccess = useCallback(() => {
    setIsOpen(false);
    setSelectedSpecialistId(null);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedSpecialistId(null);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Book Appointment
        </Button>
      </DialogTrigger>

      <DialogContent className="min-w-2xl p-6">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Please select a specialist and date for your appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <SpecialistSelect onSelect={handleSpecialistSelect} />

          {selectedSpecialistId && (
            <BookingCalendar specialistId={selectedSpecialistId} onSuccess={handleBookingSuccess} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
