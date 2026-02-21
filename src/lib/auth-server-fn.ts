import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { attempt } from "@/lib/attempt";
import { auth } from "@/lib/auth";
import { authMiddleware } from "@/lib/auth-middleware";
import { signUpSession } from "@/schemas/sign-up-session.schema";
import { getSignUpSession, updateSignUpSession } from "@/server/session";

export const getUserId = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => context.user.id);

export const getJwt = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => context.jwt);

export const createUser = createServerFn({ method: "POST" })
  .inputValidator(signUpSession)
  .handler(async ({ data }) => {
    const session = await getSignUpSession();

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
        await updateSignUpSession({
          data: {
            createdUserId: authResult.user.id,
            accountData: data.accountData,
            state: "user-data",
          },
        });

        throw redirect({ to: "/auth/sign-up/user-data" });
      }

      // User data: Just save and go to payment
      case "user-data": {
        if (!data.userData) {
          throw redirect({ to: "/auth/sign-up/user-data" });
        }

        await updateSignUpSession({
          data: {
            ...session,
            userData: data.userData,
          },
        });

        throw redirect({ to: "/auth/sign-up/payment-info" });
      }

      default:
        throw redirect({ to: "/auth/sign-up" });
    }
  });

export const getSessionData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => await getSignUpSession());
