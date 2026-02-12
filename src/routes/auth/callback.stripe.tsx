import { createFileRoute, redirect } from "@tanstack/react-router";

import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import { useSignUpSession } from "@/server/session";
import { UserRegistrationService } from "@/services/user-registration.service";
import { apiKeyConfig } from "@/lib/api-key.config";
import { attempt } from "@/lib/attempt";

export const completeSignup = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSignUpSession();
  const { createdUserId, accountData, userData } = session.data;

  if (!createdUserId || !accountData || !userData) {
    throw redirect({ to: "/auth/sign-up" });
  }

  // Provision to backend API
  const { error: provisionError } = await attempt(async () => {
    const service = new UserRegistrationService(apiKeyConfig);
    await Effect.runPromise(
      service.post({
        user_id: createdUserId,
        email: accountData.email,
        specialist_id: userData.primaryCareSpecialist,
        first_name: accountData.firstName,
        last_name: accountData.lastName,
        phone: userData.phoneNumber,
      }),
    );
  });

  if (provisionError) {
    // Keep session for retry, show error
    throw redirect({
      to: "/auth/sign-up/payment-info",
      search: { error: "provisioning_failed" },
    });
  }

  // Success! Clear session
  await session.clear();
  throw redirect({ to: "/dashboard" });
});

export const Route = createFileRoute("/auth/callback/stripe")({
  component: () => null, // Never renders, always redirects
  loader: async () => {
    await completeSignup();
    // Should never reach here due to redirects above
    throw redirect({ to: "/dashboard" });
  },
});
