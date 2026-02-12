import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import type { IsLoading, SignInSchema } from "@/types/auth";
import type { FieldConfigs } from "@/types/form-types";
import { useAppForm } from "@/hooks/form-context";
import SocialSignOn from "@/components/social-sign-on";
import { dynamicFormFactory } from "@/components/dynamic-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { signIn } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { signInSchema } from "@/schemas/sing-in.schema";

const fieldConfigs: FieldConfigs<SignInSchema> = {
  email: {
    label: "Email",
    type: "email",
  },
  password: {
    label: "Password",
    type: "password",
  },
  rememberMe: {
    label: "Remember me",
    type: "checkbox",
    orientation: "horizontal",
  },
} as const;

const defaultValues: SignInSchema = {
  email: "test@example.com",
  password: "",
  rememberMe: false,
};

const Form = dynamicFormFactory({
  fieldConfigs,
  defaultValues,
});

export default function SignIn() {
  const [isLoading, setIsLoading] = useState<IsLoading>({
    loading: false,
    type: "email",
  });
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    } as SignInSchema,
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value: data }) => {
      await signIn.email({
        ...data,
        callbackURL: "/dashboard",
        fetchOptions: {
          onError: (err) => setError(err.error.message),
          onRequest: () => setIsLoading({ loading: true, type: "email" }),
          onResponse: () => setIsLoading({ loading: false, type: "email" }),
          onSuccess: () => (toast.success("Successfully signed in!"), undefined),
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card className="[view-transition-name:auth-card]">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Sign in with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <SocialSignOn isLoading={isLoading} setIsLoading={setIsLoading} />
          <span className="block text-center text-sm mx-auto mt-10">Or continue with</span>
          <Separator className="mb-6" />
          {error && (
            <Alert variant={"destructive"} className="mb-5">
              <AlertTitle>Error signing up</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-4 mb-4">
            <Form
              form={form}
              buttonGroup={
                <div className="flex items-center gap-3 mt-4">
                  <form.SubscribeButton label="Submit" />
                  <form.ResetButton label="Reset" />
                </div>
              }
            />
          </div>
        </CardContent>
        <CardFooter className="gap-2 text-sm text-center">
          <span>Don&lsquo;t have an account?</span>
          <Link to="/auth/sign-up" className="underline underline-offset-4">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
