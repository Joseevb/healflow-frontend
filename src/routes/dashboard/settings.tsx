import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw, Settings } from "lucide-react";

import type { FieldConfigs } from "@/types/form-types";
import type { SettingsFormSchema } from "@/types/settings";
import { getUserProfileOptions } from "@/client/@tanstack/react-query.gen";
import { updateUserProfile } from "@/client/sdk.gen";
import { attempt } from "@/lib/attempt";
import { useAppForm } from "@/hooks/form-context";
import { dynamicFormFactory } from "@/components/dynamic-form";
import { settingsSchema } from "@/schemas/settings.schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/dashboard/settings")({
  component: RouteComponent,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(getUserProfileOptions());
  },
  pendingComponent: LoadingComponent,
  errorComponent: ErrorBoundaryComponent,
});

const fieldConfigs: FieldConfigs<SettingsFormSchema> = {
  firstName: {
    label: "First name",
    type: "text",
    placeholder: "Enter your first name",
    group: { name: "name", orientation: "horizontal" },
  },
  lastName: {
    label: "Last name",
    type: "text",
    placeholder: "Enter your last name",
    group: { name: "name", orientation: "horizontal" },
  },
  phone: {
    label: "Phone number",
    type: "tel",
    placeholder: "+1 (555) 000-0000",
  },
  dateOfBirth: {
    label: "Date of birth",
    type: "date",
  },
};

const defaultValues: SettingsFormSchema = {
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
};

const Form = dynamicFormFactory({
  fieldConfigs,
  defaultValues,
});

function LoadingComponent() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-4 w-80" />
      </header>

      <Card className="border shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorBoundaryComponent({ error }: { error: Error }) {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Settings className="size-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-muted-foreground max-w-md">
          Manage your account settings and preferences.
        </p>
      </header>

      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="size-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-red-900 dark:text-red-200">
                Failed to Load Settings
              </h3>
              <p className="text-red-700 dark:text-red-300 max-w-md">
                We couldn't retrieve your profile information. Please try refreshing the page or
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

function SettingsForm() {
  const { data: userProfile } = useSuspenseQuery(getUserProfileOptions());
  const queryClient = useQueryClient();

  const formDefaultValues: SettingsFormSchema = {
    firstName: userProfile.first_name || "",
    lastName: userProfile.last_name || "",
    phone: userProfile.phone || "",
    dateOfBirth: userProfile.date_of_birth || "",
  };

  const form = useAppForm({
    defaultValues: formDefaultValues,
    validators: { onSubmit: settingsSchema },
    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Updating profile...");

      const { error } = await attempt(() =>
        updateUserProfile({
          body: {
            first_name: value.firstName,
            last_name: value.lastName,
            phone: value.phone,
            date_of_birth: value.dateOfBirth,
          },
        }),
      );

      if (error) {
        toast.error("Failed to update profile. Please try again.", {
          id: toastId,
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: getUserProfileOptions().queryKey,
      });

      toast.success("Profile updated successfully!", { id: toastId });
    },
  });

  return (
    <Form
      form={form}
      buttonGroup={
        <div className="flex items-center gap-3 mt-4">
          <form.SubscribeButton label="Save changes" />
          <form.ResetButton label="Reset" />
        </div>
      }
    />
  );
}

function AccountInformation() {
  const { data: userProfile } = useSuspenseQuery(getUserProfileOptions());

  return (
    <Card className="border shadow-lg">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>View your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{userProfile.email || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">User ID</p>
            <p className="font-mono text-xs text-muted-foreground">{userProfile.id || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Profile Status</p>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  userProfile.is_profile_complete ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
              <span className="text-sm font-medium">
                {userProfile.is_profile_complete ? "Complete" : "Incomplete"}
              </span>
            </div>
          </div>
          {userProfile.primary_specialist && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Primary Specialist</p>
              <p className="text-sm font-medium">
                {userProfile.primary_specialist.name}{" "}
                <span className="text-muted-foreground">
                  ({userProfile.primary_specialist.specialty})
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Settings className="size-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-muted-foreground max-w-md">
          Manage your account settings and preferences.
        </p>
      </header>

      <Card className="border shadow-lg">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex gap-3 items-center justify-center py-8 text-sm text-muted-foreground">
                <Spinner />
                <span>Loading form...</span>
              </div>
            }
          >
            <SettingsForm />
          </Suspense>
        </CardContent>
      </Card>

      <Suspense fallback={null}>
        <AccountInformation />
      </Suspense>
    </div>
  );
}
