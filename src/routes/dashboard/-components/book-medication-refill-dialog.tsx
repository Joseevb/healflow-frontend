import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { ApiProblemDetail } from "@/client";
import {
  createAppointmentMutation,
  getAvailableSpecialistsOptions,
  getPastAppointmentsOptions,
  getSpecialistBookingDataOptions,
  getUpcomingAppointmentsOptions,
  getUserMedicinesOptions,
} from "@/client/@tanstack/react-query.gen";
import Calendar from "@/components/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

interface BookMedicationRefillDialogProps {
  medicationName?: string;
  trigger?: React.ReactNode;
}

export default function BookMedicationRefillDialog({
  medicationName,
  trigger,
}: Readonly<BookMedicationRefillDialogProps>) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch General Practice specialists only
  const {
    data: specialistsResponse,
    isLoading: isLoadingSpecialists,
    error: specialistsError,
  } = useQuery(
    getAvailableSpecialistsOptions({
      query: {
        type: "GENERAL_PRACTICE",
      },
    }),
  );

  // Auto-select the first available GP specialist
  const selectedSpecialist = specialistsResponse?.[0] || null;
  const selectedSpecialistId = selectedSpecialist?.id || null;

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const {
    data: bookingDataResponse,
    isLoading: isLoadingBookingData,
    isFetched: isFetchedBookingData,
    error: bookingDataError,
  } = useQuery({
    ...getSpecialistBookingDataOptions({
      path: {
        specialistId: selectedSpecialistId!,
      },
      query: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    }),
    enabled: selectedSpecialistId !== null,
  });

  const { mutate, isPending: isLoadingCreateAppointment } = useMutation({
    ...createAppointmentMutation(),
    onSuccess: () => {
      toast.success("Prescription renewal appointment created successfully!");
      setDialogOpen(false);
      // Invalidate all related queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: getUpcomingAppointmentsOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getPastAppointmentsOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getUserMedicinesOptions().queryKey,
      });
    },
    onError: (error) => {
      const apiError = (error as { data: ApiProblemDetail }).data;
      toast.error(apiError.detail || "Failed to create appointment");
    },
  });

  function action(date: Date, time: string) {
    date.setHours(Number.parseInt(time.split(":")[0]), Number.parseInt(time.split(":")[1]));

    const notes = medicationName
      ? `Prescription renewal for ${medicationName}`
      : "Prescription renewal";

    mutate({
      body: {
        appointment_date: date.toISOString(),
        specialist_id: selectedSpecialistId!,
        notes,
      },
    });
  }

  const fullyBookedDates =
    bookingDataResponse
      ?.filter((day) => day.timeslots.every((slot) => slot.status === "booked"))
      .map((day) => day.date) ?? [];

  const timeSlots =
    bookingDataResponse?.find(
      (day) => day.date.split("T")[0] === selectedDate?.toISOString().split("T")[0],
    )?.timeslots ?? [];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="min-w-fit p-6">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Schedule Prescription Renewal</DialogTitle>
          <DialogDescription>
            Book an appointment with a General Practice specialist to renew your prescription or
            discuss your current medications.
          </DialogDescription>
        </DialogHeader>

        {isLoadingSpecialists ? (
          <div className="py-4 flex gap-2 items-center justify-center text-sm text-muted-foreground">
            <Spinner />
            <span>Loading specialists...</span>
          </div>
        ) : specialistsError ? (
          <div className="py-4 text-center text-sm text-destructive">Error loading specialists</div>
        ) : !selectedSpecialist ? (
          <div className="py-4 text-center text-sm text-destructive">
            No General Practice specialists available. Please try again later.
          </div>
        ) : (
          <>
            <Field>
              <FieldLabel>General Practice Specialist</FieldLabel>
              <div className="p-3 bg-muted rounded-md border">
                <div className="font-medium">{selectedSpecialist.name}</div>
                <div className="text-sm text-muted-foreground">General Practice</div>
              </div>
              <FieldDescription>
                Your appointment will be scheduled with an available GP specialist
              </FieldDescription>
            </Field>

            {medicationName && (
              <Field>
                <FieldLabel>Medication</FieldLabel>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-md border border-purple-200 dark:border-purple-800">
                  <div className="font-medium text-purple-900 dark:text-purple-100">
                    {medicationName}
                  </div>
                </div>
                <FieldDescription>
                  This appointment is for renewing this medication
                </FieldDescription>
              </Field>
            )}
          </>
        )}

        {isFetchedBookingData && isLoadingBookingData ? (
          <div className="py-4 flex gap-2 items-center justify-center text-sm text-muted-foreground">
            <Spinner />
            <span>Loading availability...</span>
          </div>
        ) : bookingDataError ? (
          <div className="py-4 text-center text-sm text-destructive">
            Error loading availability
          </div>
        ) : (
          selectedSpecialistId &&
          bookingDataResponse && (
            <Calendar
              bookedDates={fullyBookedDates.map((date) => new Date(date))}
              timeSlots={timeSlots}
              action={action}
              onSelect={setSelectedDate}
              isLoading={isLoadingCreateAppointment}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
