import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { Effect } from "effect";

import { apiKeyConfig } from "./api-key.config";
import { attempt } from "@/lib/attempt";
import { auth } from "@/lib/auth";
import { authMiddleware } from "@/lib/auth-middleware";
import { signUpSession } from "@/schemas/sign-up-session.schema";
import { useSignUpSession } from "@/server/session";
import { UserRegistrationService } from "@/services/user-registration.service";

export const getUserId = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => context.user.id);

export const getJwt = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => context.jwt);

export const createUser = createServerFn({ method: "POST" })
  .inputValidator(signUpSession)
  .handler(async ({ data }) => {
    const session = await useSignUpSession();

    // TODO: Implement this
    async function storeImage(file: File) {
      const imageName = file.name.replace(/\.[^/.]+$/, "");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return imageName;
    }

    switch (data.state) {
      // Email signup: Create Better Auth user immediately
      case "email": {
        if (!data.accountData?.password) {
          throw redirect({ to: "/auth/sign-up" });
        }

        const { password, firstName, lastName, email, profileImage } = data.accountData;

        if (profileImage) {
          const imageName = await storeImage(profileImage);
          data.accountData.profileImageRef = imageName;
        }

        const { data: authResult, error } = await attempt(
          async () =>
            await auth.api.signUpEmail({
              body: {
                name: `${firstName} ${lastName}`,
                email,
                password,
              },
            }),
        );

        if (error || !authResult.user.id) {
          throw new Error("Failed to create account");
        }

        // Store in session for later provisioning (AFTER payment)
        await session.update({
          createdUserId: authResult.user.id,
          accountData: data.accountData,
          state: "user-data",
        });

        throw redirect({ to: "/auth/sign-up/user-data" });
      }

      // User data: Just save and go to payment
      case "user-data": {
        if (!data.userData) {
          throw redirect({ to: "/auth/sign-up/user-data" });
        }

        await session.update({
          ...session.data,
          userData: data.userData,
          state: "payment-info",
        });

        throw redirect({ to: "/auth/sign-up/payment-info" });
      }

      // Payment success: NOW provision to backend API
      case "payment-info": {
        const { createdUserId, accountData, userData } = session.data;

        if (!createdUserId || !accountData || !userData) {
          throw redirect({ to: "/auth/sign-up" });
        }

        if (!data.isPaymentSuccessfull) {
          throw redirect({ to: "/auth/sign-up/payment-info" });
        }

        // 🎯 PROVISION TO BACKEND API HERE (after payment!)
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
          console.error("Provisioning failed:", provisionError);
          // Don't delete the user — they paid! Log for manual fix
          throw new Error("Account created but setup incomplete. Contact support.");
        }

        // Success! Clear session and go to dashboard
        await session.clear();
        throw redirect({ to: "/dashboard" });
      }

      default:
        throw redirect({ to: "/auth/sign-up" });
    }
  });

export const getSessionData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const session = await useSignUpSession();
    return session.data;
  });
