import { createFileRoute, redirect } from "@tanstack/react-router";
import { Effect } from "effect";
import { UserRegistrationService } from "@/services/user-registration.service";
import { apiKeyConfig } from "@/lib/api-key.config";
import { attempt } from "@/lib/attempt";
import { clearSignUpSession, getSignUpSession } from "@/server/session";

export const Route = createFileRoute("/auth/callback/stripe")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        console.log("STRIPE CALLBACK", request);
        const { createdUserId, accountData, userData } = await getSignUpSession();
        // if (!createdUserId || !accountData || !userData) {
        //   throw redirect({ to: "/auth/sign-up" });
        // }

        // Provision to backend API
        const { error: provisionError } = await attempt(async () => {
          const service = new UserRegistrationService(apiKeyConfig);
          await Effect.runPromise(
            service.post({
              user_id: createdUserId!,
              email: accountData!.email,
              specialist_id: userData!.primaryCareSpecialist,
              first_name: accountData!.firstName,
              last_name: accountData!.lastName,
              phone: userData!.phoneNumber,
            }),
          );
        });

        if (provisionError) {
          console.error("[Stripe Callback] Provisioning failed:", provisionError);
          // Keep session for retry, show error
          throw redirect({
            to: "/auth/sign-up/payment-info",
            search: { error: "provisioning_failed" },
          });
        }

        console.log("[Stripe Callback] User provisioned successfully");

        // Success! Clear session
        await clearSignUpSession();
        throw redirect({ to: "/dashboard" });
      },
    },
  },
  // beforeLoad: async (ctx) => {
  //   console.log("STRIPE CALLBACK", ctx);
  //   const { createdUserId, accountData, userData } = await getSignUpSession();
  //   // if (!createdUserId || !accountData || !userData) {
  //   //   throw redirect({ to: "/auth/sign-up" });
  //   // }

  //   // Provision to backend API
  //   const { error: provisionError } = await attempt(async () => {
  //     const service = new UserRegistrationService(apiKeyConfig);
  //     await Effect.runPromise(
  //       service.post({
  //         user_id: createdUserId!,
  //         email: accountData!.email,
  //         specialist_id: userData!.primaryCareSpecialist,
  //         first_name: accountData!.firstName,
  //         last_name: accountData!.lastName,
  //         phone: userData!.phoneNumber,
  //       }),
  //     );
  //   });

  //   if (provisionError) {
  //     console.error("[Stripe Callback] Provisioning failed:", provisionError);
  //     // Keep session for retry, show error
  //     throw redirect({
  //       to: "/auth/sign-up/payment-info",
  //       search: { error: "provisioning_failed" },
  //     });
  //   }

  //   console.log("[Stripe Callback] User provisioned successfully");

  //   // Success! Clear session
  //   await clearSignUpSession();
  //   throw redirect({ to: "/dashboard" });
  // },
});
