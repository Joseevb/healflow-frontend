import { createFileRoute } from "@tanstack/react-router";
import { memo, useCallback, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar,
  ClipboardList,
  Droplets,
  Footprints,
  Heart,
  Moon,
  RefreshCw,
  Scale,
  Thermometer,
  Timer,
  TrendingUp,
  Wind,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { HealthMetricResponse, HealthMetricSummary, HealthScoreResponse } from "@/client";
import { DataTable } from "@/components/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getLatestHealthScoreOptions,
  getRecentHealthMetricsOptions,
} from "@/client/@tanstack/react-query.gen";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Custom retry function that doesn't retry on 404 errors.
 * 404 is expected for new users without health data.
 */
const noRetryOn404 = (failureCount: number, error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status: number }).status === 404
  ) {
    return false;
  }
  return failureCount < 3;
};

export const Route = createFileRoute("/dashboard/health-metrics")({
  loader: async ({ context }) => {
    // Prefetch both queries in parallel - don't fail on 404 (expected for new users)
    await Promise.all([
      context.queryClient
        .prefetchQuery({
          ...getLatestHealthScoreOptions(),
          retry: noRetryOn404,
        })
        .catch(() => {}),
      context.queryClient.prefetchQuery({
        ...getRecentHealthMetricsOptions(),
        retry: noRetryOn404,
      }),
    ]);
  },
  component: RouteComponent,
  pendingComponent: LoadingComponent,
});

// Metric type configuration - static, never changes
type MetricConfig = { label: string; icon: LucideIcon; color: string; bgColor: string };

const METRIC_CONFIG: Record<string, MetricConfig> = {
  BLOOD_PRESSURE_SYSTOLIC: {
    label: "Blood Pressure (Systolic)",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  BLOOD_PRESSURE_DIASTOLIC: {
    label: "Blood Pressure (Diastolic)",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  HEART_RATE: {
    label: "Heart Rate",
    icon: Activity,
    color: "text-pink-600",
    bgColor: "bg-pink-100 dark:bg-pink-900/20",
  },
  OXYGEN_SATURATION: {
    label: "Oxygen Saturation",
    icon: Wind,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  WEIGHT: {
    label: "Weight",
    icon: Scale,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  HEIGHT: {
    label: "Height",
    icon: TrendingUp,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
  },
  BMI: {
    label: "BMI",
    icon: Scale,
    color: "text-violet-600",
    bgColor: "bg-violet-100 dark:bg-violet-900/20",
  },
  BLOOD_GLUCOSE: {
    label: "Blood Glucose",
    icon: Droplets,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
  },
  HBA1C: {
    label: "HbA1c",
    icon: Droplets,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
  CHOLESTEROL_TOTAL: {
    label: "Total Cholesterol",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-100 dark:bg-rose-900/20",
  },
  CHOLESTEROL_LDL: {
    label: "LDL Cholesterol",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  CHOLESTEROL_HDL: {
    label: "HDL Cholesterol",
    icon: Heart,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  TRIGLYCERIDES: {
    label: "Triglycerides",
    icon: Droplets,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  BODY_TEMPERATURE: {
    label: "Body Temperature",
    icon: Thermometer,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
  RESPIRATORY_RATE: {
    label: "Respiratory Rate",
    icon: Wind,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
  },
  SLEEP_HOURS: {
    label: "Sleep Hours",
    icon: Moon,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
  },
  EXERCISE_MINUTES: {
    label: "Exercise Minutes",
    icon: Timer,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  WATER_INTAKE: {
    label: "Water Intake",
    icon: Droplets,
    color: "text-sky-600",
    bgColor: "bg-sky-100 dark:bg-sky-900/20",
  },
  STEPS: {
    label: "Steps",
    icon: Footprints,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
  },
};

const DEFAULT_CONFIG: MetricConfig = {
  label: "Unknown",
  icon: Activity,
  color: "text-slate-600",
  bgColor: "bg-slate-100 dark:bg-slate-900/20",
};

function getMetricConfig(metricType: string): MetricConfig {
  return METRIC_CONFIG[metricType] ?? DEFAULT_CONFIG;
}

// Loading Component
function LoadingComponent() {
  return (
    <div className="space-y-8">
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

      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Error Component
const ErrorBoundaryComponent = memo(function ErrorBoundaryComponent({ error }: { error: Error }) {
  const handleRetry = useCallback(() => window.location.reload(), []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <Activity className="size-5 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-emerald-600 via-emerald-800 to-emerald-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-400 bg-clip-text text-transparent">
              Health Metrics
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md">
            Track and monitor your vital signs, lab results, and wellness indicators.
          </p>
        </div>
      </header>

      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="size-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-red-900 dark:text-red-200">
                Failed to Load Health Metrics
              </h3>
              <p className="text-red-700 dark:text-red-300 max-w-md">
                We couldn't retrieve your health data. Please try refreshing the page or contact
                support if the problem persists.
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
              onClick={handleRetry}
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
});

// Memoized cell components for table
const MetricTypeCell = memo(function MetricTypeCell({ metricType }: { metricType: string }) {
  const config = getMetricConfig(metricType);
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-3 py-1">
      <div className={cn("p-2.5 rounded-lg ring-1 ring-slate-200/50", config.bgColor)}>
        <Icon className={cn("size-4", config.color)} />
      </div>
      <span className="font-semibold text-slate-900 dark:text-slate-100">{config.label}</span>
    </div>
  );
});

const ValueCell = memo(function ValueCell({ value, unit }: { value: number; unit: string }) {
  return (
    <Badge variant="secondary" size="sm" className="font-medium">
      {value} {unit}
    </Badge>
  );
});

const DateCell = memo(function DateCell({ dateString }: { dateString: string }) {
  const formatted = useMemo(() => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }, [dateString]);

  return <span className="text-slate-600 dark:text-slate-300">{formatted}</span>;
});

const SourceCell = memo(function SourceCell({ source }: { source?: string }) {
  return <span className="text-slate-500 dark:text-slate-400">{source || "Manual"}</span>;
});

const NotesCell = memo(function NotesCell({ notes }: { notes?: string }) {
  return (
    <span className="text-slate-500 dark:text-slate-400 truncate max-w-50 block">
      {notes || "-"}
    </span>
  );
});

// Static column headers - defined once
const MetricHeader = () => (
  <span className="flex items-center gap-2">
    <Activity className="size-4 text-emerald-600" />
    Metric
  </span>
);

const RecordedHeader = () => (
  <span className="flex items-center gap-2">
    <Calendar className="size-4 text-blue-600" />
    Recorded
  </span>
);

// Static columns definition - created once, never recreated
const STATIC_COLUMNS: Array<ColumnDef<HealthMetricResponse>> = [
  {
    accessorKey: "metric_type",
    header: MetricHeader,
    cell: ({ row }) => <MetricTypeCell metricType={row.original.metric_type} />,
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => <ValueCell value={row.original.value} unit={row.original.unit} />,
  },
  {
    accessorKey: "recorded_at",
    header: RecordedHeader,
    cell: ({ row }) => <DateCell dateString={row.original.recorded_at} />,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => <SourceCell source={row.original.source} />,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => <NotesCell notes={row.original.notes} />,
  },
];

// Health Score Card
interface HealthScoreCardProps {
  healthScore: HealthScoreResponse;
}

const HealthScoreCard = memo(function HealthScoreCard({ healthScore }: HealthScoreCardProps) {
  const { scoreColor, scoreBgColor } = useMemo(() => {
    const score = healthScore.overall_score;
    if (score >= 80) {
      return { scoreColor: "text-green-600", scoreBgColor: "from-green-500 to-emerald-500" };
    }
    if (score >= 60) {
      return { scoreColor: "text-yellow-600", scoreBgColor: "from-yellow-500 to-amber-500" };
    }
    return { scoreColor: "text-red-600", scoreBgColor: "from-red-500 to-rose-500" };
  }, [healthScore.overall_score]);

  const subscores = useMemo(
    () =>
      [
        { label: "Cardiovascular", value: healthScore.cardiovascular_score },
        { label: "Metabolic", value: healthScore.metabolic_score },
        { label: "Lifestyle", value: healthScore.lifestyle_score },
        { label: "Vital Signs", value: healthScore.vital_signs_score },
      ].filter((s) => s.value !== undefined),
    [
      healthScore.cardiovascular_score,
      healthScore.metabolic_score,
      healthScore.lifestyle_score,
      healthScore.vital_signs_score,
    ],
  );

  const recommendations = healthScore.recommendations?.slice(0, 2);

  return (
    <Card className="border-0 shadow-lg bg-linear-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div
              className={cn(
                "w-32 h-32 rounded-full bg-linear-to-br flex items-center justify-center shadow-lg",
                scoreBgColor,
              )}
            >
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                <span className={cn("text-4xl font-bold", scoreColor)}>
                  {healthScore.overall_score === 0 ? "—" : healthScore.overall_score}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Overall Health Score
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on {healthScore.data_points_count} data points over {healthScore.period_days}{" "}
                days
              </p>
            </div>

            {subscores.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subscores.map((subscore) => (
                  <div key={subscore.label} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{subscore.label}</p>
                    <p className="text-lg font-semibold">
                      {subscore.value === 0 ? "No data" : `${subscore.value}/100`}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {recommendations && recommendations.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Recommendations
                </p>
                <div className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "text-sm p-2 rounded-lg",
                        rec.priority === "high"
                          ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                          : rec.priority === "medium"
                            ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                            : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                      )}
                    >
                      <span className="font-medium">{rec.category}:</span> {rec.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Metric Summary Card
interface MetricSummaryCardProps {
  summary: HealthMetricSummary;
}

const MetricSummaryCard = memo(function MetricSummaryCard({ summary }: MetricSummaryCardProps) {
  const config = getMetricConfig(summary.metric_type);
  const Icon = config.icon;

  const { TrendIcon, trendColor } = useMemo(() => {
    if (summary.trend === "improving") {
      return { TrendIcon: ArrowUp, trendColor: "text-green-600" };
    }
    if (summary.trend === "declining") {
      return { TrendIcon: ArrowDown, trendColor: "text-red-600" };
    }
    return { TrendIcon: ArrowRight, trendColor: "text-slate-500" };
  }, [summary.trend]);

  const showTrend = summary.trend && summary.trend !== "insufficient_data";

  return (
    <Card className="group border-0 shadow-md hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
              config.bgColor,
            )}
          >
            <Icon className={cn("size-6", config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{config.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                {summary.latest_value === 0 ? "No data" : summary.latest_value}{" "}
                <span className="text-sm font-normal">{summary.unit}</span>
              </p>
              {showTrend && <TrendIcon className={cn("size-4", trendColor)} />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Metric Table Card
interface MetricTableCardProps {
  metrics: Array<HealthMetricResponse>;
}

const MetricTableCard = memo(function MetricTableCard({ metrics }: MetricTableCardProps) {
  return (
    <Card className="border border-slate-200/80 dark:border-slate-700/80 shadow-lg dark:shadow-slate-900/50 overflow-hidden p-0 bg-white dark:bg-slate-800/80">
      <CardHeader className="bg-linear-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-b border-emerald-200/80 dark:border-emerald-800/50 rounded-t-xl pt-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
            <Activity className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Recent Measurements</CardTitle>
            <CardDescription>Your health metrics from the last 90 days</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable columns={STATIC_COLUMNS} data={metrics} />
      </CardContent>
    </Card>
  );
});

// Empty State Component
const EmptyStateComponent = memo(function EmptyStateComponent() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <Activity className="size-5 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-emerald-600 via-emerald-800 to-emerald-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-400 bg-clip-text text-transparent">
              Health Metrics
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md">
            Track and monitor your vital signs, lab results, and wellness indicators.
          </p>
        </div>
      </header>

      <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <ClipboardList className="size-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                No Health Metrics Yet
              </h3>
              <p className="text-muted-foreground max-w-md">
                Start tracking your health by adding your first metric. Record vital signs, lab
                results, and lifestyle data to monitor your wellness over time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Main Content Component - separated to avoid hook order issues
interface HealthMetricsContentProps {
  healthScore: HealthScoreResponse | undefined;
  recentMetrics: Array<HealthMetricResponse>;
}

const HealthMetricsContent = memo(function HealthMetricsContent({
  healthScore,
  recentMetrics,
}: HealthMetricsContentProps) {
  const metricSummaries = useMemo(() => {
    const metricMap = new Map<string, HealthMetricResponse>();
    for (const metric of recentMetrics) {
      const existing = metricMap.get(metric.metric_type);
      if (!existing || new Date(metric.recorded_at) > new Date(existing.recorded_at)) {
        metricMap.set(metric.metric_type, metric);
      }
    }
    return Array.from(metricMap.values())
      .slice(0, 4)
      .map(
        (m): HealthMetricSummary => ({
          metric_type: m.metric_type,
          latest_value: m.value,
          unit: m.unit,
          recorded_at: m.recorded_at,
        }),
      );
  }, [recentMetrics]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <Activity className="size-5 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-emerald-600 via-emerald-800 to-emerald-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-400 bg-clip-text text-transparent">
              Health Metrics
            </h1>
            <Badge variant="success" size="sm">
              {recentMetrics.length} Records
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-md">
            Track and monitor your vital signs, lab results, and wellness indicators.
          </p>
        </div>
      </header>

      {healthScore && <HealthScoreCard healthScore={healthScore} />}

      {metricSummaries.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metricSummaries.map((summary) => (
            <MetricSummaryCard key={summary.metric_type} summary={summary} />
          ))}
        </div>
      )}

      <MetricTableCard metrics={recentMetrics} />
    </div>
  );
});

// Main Component
function RouteComponent() {
  const {
    data: healthScore,
    isLoading: isLoadingScore,
    error: scoreError,
  } = useQuery({
    ...getLatestHealthScoreOptions(),
    retry: noRetryOn404,
  });

  const {
    data: recentMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
  } = useQuery({
    ...getRecentHealthMetricsOptions(),
    retry: noRetryOn404,
  });

  // Check for 404 errors (no data exists)
  const isScoreNotFound =
    scoreError &&
    typeof scoreError === "object" &&
    "status" in scoreError &&
    (scoreError as { status: number }).status === 404;

  const isMetricsNotFound =
    metricsError &&
    typeof metricsError === "object" &&
    "status" in metricsError &&
    (metricsError as { status: number }).status === 404;

  // Show loading state
  if (isLoadingScore || isLoadingMetrics) {
    return <LoadingComponent />;
  }

  // Handle non-404 errors first
  if (scoreError && !isScoreNotFound) {
    return <ErrorBoundaryComponent error={scoreError as Error} />;
  }
  if (metricsError && !isMetricsNotFound) {
    return <ErrorBoundaryComponent error={metricsError as Error} />;
  }

  // Show empty state if metrics returns 404 or no data
  if (isMetricsNotFound || !recentMetrics || recentMetrics.length === 0) {
    return <EmptyStateComponent />;
  }

  return <HealthMetricsContent healthScore={healthScore} recentMetrics={recentMetrics} />;
}
