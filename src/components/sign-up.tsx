import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { IsLoading, SignUpSchema } from "@/types/auth";
import type { FieldConfigs } from "@/types/form-types";
import { dynamicFormFactory } from "@/components/dynamic-form";
import LegalDisclaimer from "@/components/legal-disclaimer";
import SocialSignOn from "@/components/social-sign-on";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppForm } from "@/hooks/form-context";
import { createUser } from "@/lib/auth-session";
import { signUpSchema } from "@/schemas/sing-up.schema";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";

const fieldConfigs: FieldConfigs<SignUpSchema> = {
  firstName: {
    label: "First name",
    type: "text",
    group: { name: "name", orientation: "horizontal" },
  },
  lastName: {
    label: "Last name",
    type: "text",
    group: { name: "name", orientation: "horizontal" },
  },
  email: { label: "Email", type: "email" },
  password: {
    label: "Password",
    type: "password",
    group: { name: "password", orientation: "horizontal" },
  },
  confirmPassword: {
    label: "Confirm password",
    type: "password",
    group: { name: "password", orientation: "horizontal" },
  },
  profileImage: { label: "Profile image (optional)", type: "file" },
} as const;

const defaultValues: SignUpSchema = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  profileImage: undefined,
};

const Form = dynamicFormFactory({
  fieldConfigs,
  defaultValues,
});

export default function SignUp() {
  const [isLoading, setIsLoading] = useState<IsLoading>({
    loading: false,
    type: "email",
  });
  const createUserFn = useServerFn(createUser);

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      profileImage: undefined,
    } as SignUpSchema,
    validators: { onSubmit: signUpSchema },
    onSubmit: async ({ value: data }) => {
      const { data: result, error } = await signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      });

      if (error) {
        toast.error(error.message || "Failed to create account");
        return;
      }

      // Store additional data in session for later
      await createUserFn({
        data: {
          accountData: data,
          createdUserId: result.user.id,
          state: "user-data",
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card className="[view-transition-name:auth-card]">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Sign up with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <SocialSignOn isLoading={isLoading} setIsLoading={setIsLoading} />
          <span className="block text-center text-sm mx-auto mt-10">Or continue with</span>
          <Separator className="mb-6" />
          <Form
            form={form}
            buttonGroup={
              <div className="flex items-center gap-3 mt-4">
                <form.SubscribeButton label="Submit" />
                <form.ResetButton label="Reset" />
              </div>
            }
          />
        </CardContent>

        <CardFooter className="gap-2 text-sm text-center">
          <span>Already have an account?</span>
          <Link to="/auth" className="underline underline-offset-4">
            Sign in
          </Link>
        </CardFooter>
      </Card>

      <LegalDisclaimer />
    </div>
  );
}
