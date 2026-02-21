import { createFileRoute, redirect } from "@tanstack/react-router";
import { Check, CreditCard, Zap } from "lucide-react";
import { toast } from "sonner";

import { useEffect } from "react";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSessionData } from "@/lib/auth-server-fn";
import { createUrl } from "@/lib/utils";

const searchParams = z.object({
  error: z.enum(["provisioning_failed", "cancelled", "unknown_error"]).optional(),
});

export const Route = createFileRoute("/auth/sign-up/payment-info")({
  validateSearch: searchParams,
  component: RouteComponent,
  loader: async ({ context }) => {
    const sessionData = await getSessionData();

    // If user is authenticated, they don't need to be on payment page
    if (context.user.id) {
      throw redirect({ to: "/dashboard" });
    }

    if (sessionData.state === "success") {
      throw redirect({ to: "/dashboard" });
    }

    if (!sessionData.accountData && !sessionData.createdUserId) {
      throw redirect({ to: "/auth/sign-up" });
    }

    if (!sessionData.userData) {
      throw redirect({ to: "/auth/sign-up/user-data" });
    }
  },
});

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "60",
    period: "month",
    description: "Flexible monthly billing",
    features: ["Full access to all features", "Cancel anytime", "Monthly billing"],
    popular: false,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "600",
    period: "year",
    description: "Best value - save 17%",
    features: ["Full access to all features", "Priority support", "17% discount", "Annual billing"],
    popular: true,
  },
] as const;

export default function RouteComponent() {
  const { error: searchError } = Route.useSearch();

  useEffect(() => {
    switch (searchError) {
      case "provisioning_failed":
        toast.error(
          "Payment succeeded but account setup failed. Please try again or contact support.",
        );
        break;
      case "unknown_error":
        toast.error("An unknown error occurred. Please try again or contact support.");
        break;
    }
  }, [searchError]);

  const handleSubscribe = async (planId: "monthly" | "yearly") => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const toastId = toast.loading(`Redirecting to secure checkout...`);

    const { error } = await authClient.subscription.upgrade({
      plan: planId,
      successUrl: createUrl("/auth/callback/stripe"),
      cancelUrl: createUrl("/auth/sign-up/payment-info", { error: "cancelled" }),
    });

    if (error) {
      toast.error(error.message || "Failed to start checkout. Please try again.", {
        id: toastId,
      });
      return;
    }

    // Success - Stripe handles the redirect, but toast will show briefly
    toast.success("Redirecting to Stripe...", { id: toastId });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Choose your plan</h1>
        <p className="text-muted-foreground">
          Select a billing option. You can change or cancel anytime.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2" variant="default">
                <Zap className="h-3 w-3 mr-1" />
                Best Value
              </Badge>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-6">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">+ VAT where applicable</p>
              </div>

              <Separator />

              <ul className="space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full mt-auto"
                size="lg"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.id)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Subscribe {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Secure payment powered by <span className="font-medium text-foreground">Stripe</span>. Your
        card details are never stored on our servers.
      </p>
    </div>
  );
}
