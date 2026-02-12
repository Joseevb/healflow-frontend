import * as React from "react";

import { isSameDay } from "date-fns";
import type { TimeSlot } from "@/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function Calendar20({
  action,
  bookedDates,
  timeSlots,
  isLoading,
  onSelect,
}: Readonly<{
  action: (date: Date, time: string) => void;
  bookedDates: Array<Date>;
  timeSlots: Array<TimeSlot>;
  isLoading: boolean;
  onSelect?: (date: Date) => void;
}>) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>("10:00");

  const onClick = () => action(date!, selectedTime!);

  return (
    <Card className="gap-0 p-0">
      <CardContent className="relative p-0 md:pr-48">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              if (d) onSelect?.(d);
            }}
            defaultMonth={date}
            disabled={[
              { dayOfWeek: [0, 6] },
              (day) => bookedDates.some((bd) => isSameDay(day, new Date(bd))),
            ]}
            showOutsideDays={false}
            className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            formatters={{
              formatWeekdayName: (d) => {
                return d.toLocaleString("en-US", { weekday: "short" });
              },
            }}
          />
        </div>
        <div className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l">
          <div className="grid gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedTime === slot.time ? "default" : "outline"}
                onClick={() => setSelectedTime(slot.time || null)}
                className="w-full shadow-none"
                disabled={slot.status === "booked"}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t px-6 py-5! md:flex-row">
        <div className="text-sm">
          {date && selectedTime ? (
            <>
              Your appointment is booked for{" "}
              <span className="font-medium">
                {" "}
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
              </span>
              at <span className="font-medium">{selectedTime}</span>.
            </>
          ) : (
            <>Select a date and time for your meeting.</>
          )}
        </div>
        <Button
          disabled={!date || !selectedTime || isLoading}
          className="w-full md:ml-auto md:w-auto"
          variant="outline"
          onClick={onClick}
        >
          {isLoading ? (
            <>
              <Spinner />
              Booking...
            </>
          ) : (
            "Book"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
