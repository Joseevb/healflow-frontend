import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertCircle, AlertTriangle, Calendar, Clock, Pill, Plus, RefreshCw } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import BookMedicationRefillDialog from "./-components/book-medication-refill-dialog";
import type { JSX } from "react";
import type { LucideIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserMedicinesResponse } from "@/client";
import { DataTable } from "@/components/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserMedicinesOptions } from "@/client/@tanstack/react-query.gen";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/medications")({
  component: RouteComponent,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(getUserMedicinesOptions());
  },
  pendingComponent: LoadingComponent,
  errorComponent: ErrorBoundaryComponent,
});

// Loading Component

function LoadingComponent() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </header>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border shadow-lg overflow-hidden p-0">
        <CardHeader className="pt-6 pb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="ml-auto h-9 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Error Component

function ErrorBoundaryComponent({ error }: { error: Error }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <Pill className="size-5 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-purple-600 via-purple-800 to-purple-600 dark:from-purple-400 dark:via-purple-500 dark:to-purple-400 bg-clip-text text-transparent">
              Medications
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md">
            Track your current medications, dosages, and manage prescription refills all in one
            place.
          </p>
        </div>
      </header>

      {/* Error Card */}
      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="size-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-red-900 dark:text-red-200">
                Failed to Load Medications
              </h3>
              <p className="text-red-700 dark:text-red-300 max-w-md">
                We couldn't retrieve your medication information. Please try refreshing the page or
                contact support if the problem persists.
              </p>
              <details className="mt-4">
                <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-left bg-red-100 dark:bg-red-900/20 p-4 rounded-md overflow-auto">
                  {error.message}
                </pre>
              </details>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <RefreshCw className="size-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Internal Components

interface MedicationIconCellProps {
  name: string;
  iconBg: string;
  iconRing: string;
  iconColor: string;
  textColor: string;
}

function MedicationIconCell({
  name,
  iconBg,
  iconRing,
  iconColor,
  textColor,
}: MedicationIconCellProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className={`p-2.5 ${iconBg} rounded-lg ring-1 ${iconRing}`}>
        <Pill className={`size-4 ${iconColor}`} />
      </div>
      <span className={`font-semibold ${textColor}`}>{name}</span>
    </div>
  );
}

interface ColumnHeaderWithIconProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
}

function ColumnHeaderWithIcon({ icon: Icon, iconColor, label }: ColumnHeaderWithIconProps) {
  return (
    <span className="flex items-center gap-2">
      <Icon className={`size-4 ${iconColor}`} />
      {label}
    </span>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  label: string;
  value: string | number;
  valueColor?: string;
}

function StatCard({ icon: Icon, iconBg, label, value, valueColor }: StatCardProps) {
  return (
    <Card className="group border-0 shadow-md hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 ${iconBg} rounded-xl transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${valueColor || ""}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MedicationTableCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  headerBg: string;
  borderColor: string;
  columns: Array<ColumnDef<UserMedicinesResponse>>;
  data: Array<UserMedicinesResponse>;
}

function MedicationTableCard({
  title,
  description,
  icon: Icon,
  iconBg,
  headerBg,
  borderColor,
  columns,
  data,
}: MedicationTableCardProps) {
  return (
    <Card className="border border-slate-200/80 dark:border-slate-700/80 shadow-lg dark:shadow-slate-900/50 overflow-hidden p-0 bg-white dark:bg-slate-800/80">
      <CardHeader className={`${headerBg} border-b ${borderColor} rounded-t-xl pt-6 pb-6`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 ${iconBg} rounded-lg`}>
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}

// Column Factories

function createMedicationNameColumn(
  iconBg: string,
  iconRing: string,
  iconColor: string,
  textColor: string,
  headerIconColor: string,
): ColumnDef<UserMedicinesResponse> {
  return {
    accessorKey: "medicine_name",
    header: () => (
      <ColumnHeaderWithIcon icon={Pill} iconColor={headerIconColor} label="Medication" />
    ),
    cell: ({ row }) => (
      <MedicationIconCell
        name={row.getValue("medicine_name")}
        iconBg={iconBg}
        iconRing={iconRing}
        iconColor={iconColor}
        textColor={textColor}
      />
    ),
  };
}

function createDosageColumn(variant: "purple" | "secondary"): ColumnDef<UserMedicinesResponse> {
  return {
    accessorKey: "dosage",
    header: "Dosage",
    cell: ({ row }) => (
      <Badge variant={variant} size="sm" className="font-medium">
        {row.getValue("dosage")}
      </Badge>
    ),
  };
}

function createTextColumn(
  key: keyof UserMedicinesResponse,
  header: string | (() => JSX.Element),
  textColor: string,
): ColumnDef<UserMedicinesResponse> {
  return {
    accessorKey: key,
    header,
    cell: ({ row }) => <span className={textColor}>{row.getValue(key)}</span>,
  };
}

// Main Component

function RouteComponent() {
  // Fetch medications from API
  const { data: medications } = useSuspenseQuery(getUserMedicinesOptions());

  const currentColumns: Array<ColumnDef<UserMedicinesResponse>> = useMemo(
    (): Array<ColumnDef<UserMedicinesResponse>> => [
      createMedicationNameColumn(
        "bg-purple-100 dark:bg-purple-900/30",
        "ring-purple-200/50 dark:ring-purple-800/50",
        "text-purple-600 dark:text-purple-400",
        "text-slate-900 dark:text-slate-100",
        "text-purple-600",
      ),
      createDosageColumn("purple"),
      createTextColumn(
        "frequency",
        () => <ColumnHeaderWithIcon icon={Clock} iconColor="text-blue-600" label="Frequency" />,
        "text-slate-600 dark:text-slate-300 font-medium",
      ),
      createTextColumn(
        "start_date",
        () => (
          <ColumnHeaderWithIcon icon={Calendar} iconColor="text-green-600" label="Start Date" />
        ),
        "text-slate-600 dark:text-slate-300",
      ),
      {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ row }) => {
          const endDate = row.original.end_date;
          return endDate ? (
            <span className="text-slate-600 dark:text-slate-300">{endDate}</span>
          ) : (
            <Badge variant="success" size="sm" className="font-medium">
              Ongoing
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <BookMedicationRefillDialog
            medicationName={row.original.medicine_name}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <RefreshCw className="size-4 mr-1.5" />
                Refill
              </Button>
            }
          />
        ),
      },
    ],
    [],
  );

  const pastColumns: Array<ColumnDef<UserMedicinesResponse>> = useMemo(
    (): Array<ColumnDef<UserMedicinesResponse>> => [
      createMedicationNameColumn(
        "bg-slate-100 dark:bg-slate-700/50",
        "ring-slate-200/50 dark:ring-slate-600/50",
        "text-slate-500 dark:text-slate-400",
        "text-slate-600 dark:text-slate-400",
        "text-slate-500",
      ),
      createDosageColumn("secondary"),
      createTextColumn("end_date", "Ended", "text-slate-600 dark:text-slate-400"),
    ],
    [],
  );

  const currentMedications = medications.filter((med) => {
    if (!med.end_date) return true; // No end date means currently active
    const endDate = new Date(med.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    return endDate >= today;
  });

  const pastMedications = medications.filter((med) => {
    if (!med.end_date) return false; // No end date means currently active, not past
    const endDate = new Date(med.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    return endDate < today;
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <Pill className="size-5 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-purple-600 via-purple-800 to-purple-600 dark:from-purple-400 dark:via-purple-500 dark:to-purple-400 bg-clip-text text-transparent">
              Medications
            </h1>
            <Badge variant="purple" size="sm">
              {currentMedications.length} Active
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-md">
            Track your current medications, dosages, and manage prescription refills all in one
            place.
          </p>
        </div>
        <div className="flex gap-2">
          <BookMedicationRefillDialog
            trigger={
              <Button variant="outline">
                <Plus className="size-4" />
                New Prescription
              </Button>
            }
          />
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Pill}
          iconBg="bg-purple-100 dark:bg-purple-900/20 text-purple-600"
          label="Active Medications"
          value={currentMedications.length}
        />
        <StatCard
          icon={AlertCircle}
          iconBg="bg-orange-100 dark:bg-orange-900/20 text-orange-600"
          label="Needs Refill"
          value={2}
          valueColor="text-orange-600"
        />
        <StatCard
          icon={Calendar}
          iconBg="bg-green-100 dark:bg-green-900/20 text-green-600"
          label="Next Refill"
          value="Dec 15"
        />
      </div>

      {/* Current Medications Table */}
      <MedicationTableCard
        title="Current Medications"
        description="Your active prescriptions and daily medications"
        icon={Pill}
        iconBg="bg-purple-100 dark:bg-purple-900/30 text-purple-600"
        headerBg="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10"
        borderColor="border-purple-200/80 dark:border-purple-800/50"
        columns={currentColumns}
        data={currentMedications}
      />

      {/* Past Medications Table */}
      <MedicationTableCard
        title="Past Medications"
        description="Previously prescribed medications and treatments"
        icon={Clock}
        iconBg="bg-slate-100 dark:bg-slate-700/50 text-slate-500"
        headerBg="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30"
        borderColor="border-slate-300/80 dark:border-slate-600/50"
        columns={pastColumns}
        data={pastMedications}
      />
    </div>
  );
}
