import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense } from "react";
import type { FieldConfigs } from "@/types/form-types";
import type { UserDataSchema } from "@/types/auth";
import type { SpecialistResponse } from "@/client";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userDataSchema } from "@/schemas/user-data.schema";
import { getAvailableSpecialistsOptions } from "@/client/@tanstack/react-query.gen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createUser, getSessionData } from "@/lib/auth-server-fn";
import { useAppForm } from "@/hooks/form-context";
import { dynamicFormFactory } from "@/components/dynamic-form";

export const Route = createFileRoute("/auth/sign-up/user-data")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const sessionData = await getSessionData();

    if (sessionData.state === "success") {
      throw redirect({
        to: "/dashboard",
      });
    }

    if (!sessionData.accountData && !sessionData.createdUserId) {
      throw redirect({
        to: "/auth/sign-up",
      });
    }

    // Prefetch specialists data for optimal performance
    await context.queryClient.ensureQueryData(
      getAvailableSpecialistsOptions({
        query: {
          type: "GENERAL_PRACTICE",
        },
      }),
    );

    return { sessionData };
  },
});

const fieldConfigsFn = (specialists: Array<SpecialistResponse>): FieldConfigs<UserDataSchema> => {
  console.debug(specialists);
  return {
    phoneNumber: {
      label: "Phone number",
      type: "text",
      group: { name: "info", orientation: "horizontal" },
    },
    dateOfBirth: {
      label: "Date of birth",
      type: "date",
      group: { name: "info", orientation: "horizontal" },
    },
    address: {
      label: "Address",
      type: "object",
      group: { name: "address", orientation: "vertical" },
      fields: {
        city: {
          label: "City",
          type: "text",
          group: { name: "address-1", orientation: "horizontal" },
        },
        state: {
          label: "State",
          type: "text",
          group: { name: "address-1", orientation: "horizontal" },
        },
        street: {
          label: "Street",
          type: "text",
          group: { name: "address-2", orientation: "horizontal" },
        },
        zipCode: {
          label: "Zip code",
          type: "text",
          group: { name: "address-2", orientation: "horizontal" },
        },
      },
      set: {
        legend: "Address",
        controlClassName: "w-full",
      },
    },
    primaryCareSpecialist: {
      label: "Primary care specialist",
      type: "select",
      group: { name: "info", orientation: "horizontal" },
      placeholder: "Select a General Practice specialist",
      // set: "User Data",
      options: specialists.map((s) => ({
        label: s.name,
        value: s.id,
      })),
    },
  };
};

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="[view-transition-name:auth-card]">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Fill up the form with your contact and address information, as well as your primary care
            specialist.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-2xl">
          <Suspense
            fallback={
              <div className="flex gap-3 items-center justify-center text-sm text-muted-foreground">
                <Spinner />
                <span>Loading specialists...</span>
              </div>
            }
          >
            <UserDataForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function UserDataForm() {
  const { sessionData } = Route.useLoaderData();
  const createUserFn = useServerFn(createUser);

  // Use useSuspenseQuery for automatic suspense boundary handling
  const { data: specialistsResponse } = useSuspenseQuery(
    getAvailableSpecialistsOptions({
      query: {
        type: "GENERAL_PRACTICE",
      },
    }),
  );

  const defaultValues: UserDataSchema = {
    phoneNumber: sessionData.userData?.phoneNumber || "",
    dateOfBirth: sessionData.userData?.dateOfBirth || "",
    address: {
      city: sessionData.userData?.address.city || "",
      state: sessionData.userData?.address.state || "",
      street: sessionData.userData?.address.street || "",
      zipCode: sessionData.userData?.address.zipCode || "",
    },
    primaryCareSpecialist: sessionData.userData?.primaryCareSpecialist || "",
  };

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: userDataSchema },
    onSubmit: async ({ value: data }) => {
      // Determine the state based on current session state
      const nextState = sessionData.state === "profile-update" ? "profile-update" : "user-data";

      await createUserFn({
        data: {
          ...sessionData,
          userData: data,
          state: nextState,
        },
      });
    },
  });

  // Only render form when specialists are loaded
  if (specialistsResponse.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No specialists available</AlertTitle>
        <AlertDescription>Unable to load specialists. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  const fieldConfigs = fieldConfigsFn(specialistsResponse);

  const Form = dynamicFormFactory({
    fieldConfigs,
    defaultValues,
  });

  return (
    <Form
      form={form}
      buttonGroup={
        <div className="flex items-center gap-3 mt-3">
          <form.SubscribeButton label="Submit" />
        </div>
      }
    />
  );
}
