import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Heart,
  Pill,
  RefreshCw,
} from "lucide-react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { AppointmentResponse, HealthMetricResponse } from "@/client";
import { getSessionData } from "@/lib/auth-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getLatestHealthScoreOptions,
  getRecentHealthMetricsOptions,
  getUpcomingAppointmentsOptions,
  getUserHealthMetricsOptions,
  getUserMedicinesOptions,
} from "@/client/@tanstack/react-query.gen";

// Route Definition

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const sessionData = await getSessionData();

    if (sessionData.createdUserId && sessionData.state && sessionData.state !== "success") {
      throw redirect({
        to: "/auth/sign-up/user-data",
      });
    }

    // Prefetch critical dashboard data in parallel for SSR
    // Health score is optional - it will be handled gracefully in the component
    await Promise.all([
      context.queryClient.ensureQueryData(getUpcomingAppointmentsOptions()),
      context.queryClient.ensureQueryData(getUserMedicinesOptions()),
      context.queryClient.ensureQueryData(getUserHealthMetricsOptions()),
      context.queryClient.ensureQueryData(getRecentHealthMetricsOptions()),
    ]);

    // Prefetch health score but don't fail the page load if it's missing (404)
    // This is expected for new users who haven't had health metrics recorded yet
    context.queryClient
      .prefetchQuery({
        ...getLatestHealthScoreOptions(),
      })
      .catch((error) => {
        // Log but don't throw - gracefully handle missing health score
        console.warn("Health score not available (expected for new users):", error);
      });
  },
  pendingComponent: LoadingComponent,
  errorComponent: ErrorBoundaryComponent,
});

// Loading Component

function LoadingComponent() {
  return (
    <div className="space-y-8">
      {/* Welcome Hero Skeleton */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-green-600 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <Skeleton className="h-6 w-32 mb-4 bg-white/20" />
          <Skeleton className="h-9 w-64 mb-2 bg-white/20" />
          <Skeleton className="h-6 w-96 mb-6 bg-white/20" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-40 bg-white/20" />
            <Skeleton className="h-10 w-48 bg-white/20" />
          </div>
        </div>
      </section>

      {/* Stats Grid Skeleton */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Quick Actions Skeleton */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader>
              <Skeleton className="h-12 w-12 rounded-xl mb-2" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent Activity Skeleton */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-700 p-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Error Component

function ErrorBoundaryComponent({ error }: { error: Error }) {
  // Try to extract status code from error object
  const errorStatus = (error as any)?.status;

  // Track error for analytics
  console.count(`DASHBOARD_ERROR_${errorStatus || "UNKNOWN"}`);

  // Define user-friendly messages per status code
  const getErrorConfig = (status?: number) => {
    switch (status) {
      case 401:
        return {
          title: "Authentication Required",
          message: "Your session has expired. Please sign in again to access your dashboard.",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          cardBg: "bg-yellow-50/50 dark:bg-yellow-900/10",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          showSignInButton: true,
        };
      case 404:
        return {
          title: "Data Not Available",
          message:
            "Some of your dashboard data is not available yet. This is normal for new accounts. Your data will appear here once you have appointments or health metrics recorded by your doctor.",
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          cardBg: "bg-blue-50/50 dark:bg-blue-900/10",
          borderColor: "border-blue-200 dark:border-blue-800",
          showSignInButton: false,
        };
      case 500:
      case 503:
        return {
          title: "Server Error",
          message: "Our servers are experiencing issues. Please try again in a few moments.",
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/30",
          cardBg: "bg-red-50/50 dark:bg-red-900/10",
          borderColor: "border-red-200 dark:border-red-800",
          showSignInButton: false,
        };
      default:
        return {
          title: "Failed to Load Dashboard",
          message:
            "We couldn't retrieve your dashboard information. Please try refreshing the page or contact support if the problem persists.",
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/30",
          cardBg: "bg-red-50/50 dark:bg-red-900/10",
          borderColor: "border-red-200 dark:border-red-800",
          showSignInButton: false,
        };
    }
  };

  const config = getErrorConfig(errorStatus);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Heart className="size-5 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <p className="text-muted-foreground max-w-md">Your health overview and quick actions</p>
        </div>
      </header>

      {/* Enhanced Error Card */}
      <Card className={`${config.borderColor} ${config.cardBg}`}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className={`p-4 ${config.iconBg} rounded-full`}>
              <AlertTriangle className={`size-10 ${config.iconColor}`} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{config.title}</h3>
              <p className="text-muted-foreground max-w-md">{config.message}</p>
              {errorStatus && (
                <p className="text-xs text-muted-foreground mt-2">Error code: {errorStatus}</p>
              )}
              <details className="mt-4">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:underline">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-left bg-muted p-4 rounded-md overflow-auto max-h-48">
                  {JSON.stringify(
                    {
                      message: error.message,
                      status: errorStatus,
                      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="size-4 mr-2" />
                Refresh Page
              </Button>
              {config.showSignInButton && (
                <Button
                  onClick={() => {
                    window.location.href = "/auth/sign-in";
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Functions

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function formatMetricTitle(metricType: string): string {
  const titleMap: Record<string, string> = {
    BLOOD_PRESSURE_SYSTOLIC: "Blood Pressure (Systolic)",
    BLOOD_PRESSURE_DIASTOLIC: "Blood Pressure (Diastolic)",
    HEART_RATE: "Heart Rate",
    OXYGEN_SATURATION: "Oxygen Saturation",
    WEIGHT: "Weight",
    HEIGHT: "Height",
    BMI: "BMI",
    BLOOD_GLUCOSE: "Blood Glucose",
    HBA1C: "HbA1c",
    CHOLESTEROL_TOTAL: "Total Cholesterol",
    CHOLESTEROL_LDL: "LDL Cholesterol",
    CHOLESTEROL_HDL: "HDL Cholesterol",
    TRIGLYCERIDES: "Triglycerides",
    BODY_TEMPERATURE: "Body Temperature",
    RESPIRATORY_RATE: "Respiratory Rate",
    SLEEP_HOURS: "Sleep Duration",
    EXERCISE_MINUTES: "Exercise",
    WATER_INTAKE: "Water Intake",
    STEPS: "Steps",
  };
  return titleMap[metricType] || metricType.replace(/_/g, " ");
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! 👋";
  if (hour < 18) return "Good afternoon! 👋";
  return "Good evening! 👋";
}

// Internal Components

interface StatCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: {
    icon: LucideIcon;
    value: string;
    color: string;
  };
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sublabel, trend }: StatCardProps) {
  return (
    <Card className="group border-0 shadow-md hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 ${iconBg} rounded-xl transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className={`size-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
            {trend && (
              <p className={`text-xs ${trend.color} flex items-center gap-1 mt-0.5`}>
                <trend.icon className="size-3" /> {trend.value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WelcomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-green-600 p-8 text-white shadow-xl">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
      <div className="relative z-10">
        <Badge
          variant="blue"
          className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30"
        >
          <Heart className="size-3 mr-1" />
          Welcome back
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{getGreeting()}</h1>
        <p className="text-blue-100 text-lg max-w-xl">
          Your health dashboard is ready. Track your appointments, medications, and health metrics
          all in one place.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            asChild
            variant="secondary"
            className="bg-white text-blue-700 hover:bg-blue-50 border-0"
          >
            <Link to="/dashboard/appointments" className="flex items-center gap-2">
              <Calendar className="size-4" />
              Book Appointment
            </Link>
          </Button>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50"
          >
            View Health Records
          </Button>
        </div>
      </div>
    </section>
  );
}

interface QuickActionCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  linkTo?: string;
  onClick?: () => void;
  colorScheme: "blue" | "purple" | "green";
  buttonLabel: string;
}

function QuickActionCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  linkTo,
  onClick,
  colorScheme,
  buttonLabel,
}: QuickActionCardProps) {
  const hoverClasses = {
    blue: "group-hover:bg-blue-50 group-hover:border-blue-200 dark:group-hover:bg-blue-900/20 dark:group-hover:border-blue-700",
    purple:
      "group-hover:bg-purple-50 group-hover:border-purple-200 dark:group-hover:bg-purple-900/20 dark:group-hover:border-purple-700",
    green:
      "group-hover:bg-green-50 group-hover:border-green-200 dark:group-hover:bg-green-900/20 dark:group-hover:border-green-700",
  };

  const shadowClasses = {
    blue: "dark:hover:shadow-blue-500/10",
    purple: "dark:hover:shadow-purple-500/10",
    green: "dark:hover:shadow-green-500/10",
  };

  const content = (
    <>
      <CardHeader>
        <div
          className={`p-3 ${iconBg} rounded-xl w-fit mb-2 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className={`size-6 ${iconColor}`} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant="outline"
          className={`w-full ${hoverClasses[colorScheme]}`}
          asChild={!!linkTo}
        >
          {linkTo ? (
            <Link to={linkTo} className="flex items-center justify-center gap-2">
              {buttonLabel}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <button
              type="button"
              className="flex items-center justify-center gap-2"
              onClick={onClick}
            >
              {buttonLabel}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </Button>
      </CardContent>
    </>
  );

  return (
    <Card
      className={`group border-0 shadow-md hover:shadow-lg ${shadowClasses[colorScheme]} transition-all duration-300 dark:bg-slate-800 dark:border-slate-700`}
    >
      {content}
    </Card>
  );
}

interface ActivityItemProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  timestamp: string;
}

function ActivityItem({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  timestamp,
}: ActivityItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className={`p-2 ${iconBg} rounded-lg`}>
        <Icon className={`size-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3" />
        {timestamp}
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

function SectionHeader({ title, actionLabel, onActionClick }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {actionLabel && (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          onClick={onActionClick}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Types for Recent Activity

interface DashboardActivity {
  type: "appointment" | "metric";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  timestamp: string;
  rawTimestamp: string;
}

// Main Component

function RouteComponent() {
  // Fetch critical data with useSuspenseQuery (will throw if fails)
  const { data: upcomingAppointments } = useSuspenseQuery(getUpcomingAppointmentsOptions());
  const { data: medications } = useSuspenseQuery(getUserMedicinesOptions());
  const { data: allMetrics } = useSuspenseQuery(getUserHealthMetricsOptions());
  const { data: recentMetrics } = useSuspenseQuery(getRecentHealthMetricsOptions());

  // Fetch health score with optional query (won't crash on 404)
  const { data: healthScore, isError: isHealthScoreError } = useQuery({
    ...getLatestHealthScoreOptions(),
    retry: false,
  });

  // Calculate stats with graceful fallback for missing health score
  const stats = useMemo(
    () => ({
      appointmentsCount: upcomingAppointments.length,
      healthScore: isHealthScoreError || !healthScore ? 0 : healthScore.overall_score,
      hasHealthScore: !isHealthScoreError && !!healthScore,
      medicationsCount: medications.length,
      metricsCount: allMetrics.length,
    }),
    [healthScore, isHealthScoreError, upcomingAppointments, medications, allMetrics],
  );

  // Transform recent activity
  const recentActivity = useMemo(() => {
    const activities: Array<DashboardActivity> = [];

    // Add recent appointments
    upcomingAppointments.slice(0, 2).forEach((apt: AppointmentResponse) => {
      activities.push({
        type: "appointment",
        icon: Calendar,
        iconBg: "bg-blue-100 dark:bg-blue-900/20",
        iconColor: "text-blue-600",
        title: `Appointment with ${apt.specialist.name}`,
        description: apt.specialist.specialty,
        timestamp: formatRelativeTime(apt.appointment_date),
        rawTimestamp: apt.appointment_date,
      });
    });

    // Add recent health metrics
    recentMetrics.slice(0, 5).forEach((metric: HealthMetricResponse) => {
      activities.push({
        type: "metric",
        icon: Activity,
        iconBg: "bg-green-100 dark:bg-green-900/20",
        iconColor: "text-green-600",
        title: `${formatMetricTitle(metric.metric_type)} recorded`,
        description: `${metric.value} ${metric.unit}`,
        timestamp: formatRelativeTime(metric.recorded_at),
        rawTimestamp: metric.recorded_at,
      });
    });

    // Sort by timestamp descending, take top 5
    return activities
      .sort((a, b) => new Date(b.rawTimestamp).getTime() - new Date(a.rawTimestamp).getTime())
      .slice(0, 5);
  }, [upcomingAppointments, recentMetrics]);

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <WelcomeHero />

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          iconBg="bg-blue-100 dark:bg-blue-900/20"
          iconColor="text-blue-600"
          label="Upcoming"
          value={stats.appointmentsCount}
          sublabel="appointments"
        />
        <StatCard
          icon={Activity}
          iconBg="bg-green-100 dark:bg-green-900/20"
          iconColor="text-green-600"
          label="Health Score"
          value={stats.hasHealthScore ? stats.healthScore : "--"}
          sublabel={stats.hasHealthScore ? undefined : "No data yet"}
        />
        <StatCard
          icon={Pill}
          iconBg="bg-purple-100 dark:bg-purple-900/20"
          iconColor="text-purple-600"
          label="Active"
          value={stats.medicationsCount}
          sublabel="medications"
        />
        <StatCard
          icon={FileText}
          iconBg="bg-orange-100 dark:bg-orange-900/20"
          iconColor="text-orange-600"
          label="Records"
          value={12}
          sublabel="documents"
        />
      </section>

      {/* Quick Actions */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          icon={Calendar}
          iconBg="bg-blue-100 dark:bg-blue-900/20"
          iconColor="text-blue-600"
          title="Appointments"
          description="Schedule and manage your upcoming appointments with healthcare providers."
          linkTo="/dashboard/appointments"
          colorScheme="blue"
          buttonLabel="View Appointments"
        />
        <QuickActionCard
          icon={Pill}
          iconBg="bg-purple-100 dark:bg-purple-900/20"
          iconColor="text-purple-600"
          title="Medications"
          description="Track your medications, dosages, and set reminders for refills."
          linkTo="/dashboard/medications"
          colorScheme="purple"
          buttonLabel="Manage Medications"
        />
        <QuickActionCard
          icon={Activity}
          iconBg="bg-green-100 dark:bg-green-900/20"
          iconColor="text-green-600"
          title="Health Metrics"
          description="Monitor your vital signs and track your health progress over time."
          colorScheme="green"
          buttonLabel="View Metrics"
        />
      </section>

      {/* Recent Activity */}
      <section>
        <SectionHeader title="Recent Activity" actionLabel="View all" />
        <Card className="border-0 shadow-md dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-700 p-0">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ActivityItem
                  key={`${activity.type}-${activity.rawTimestamp}-${activity.title}`}
                  {...activity}
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Activity className="size-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No recent activity</p>
                <p className="text-sm">Your recent health activities will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
