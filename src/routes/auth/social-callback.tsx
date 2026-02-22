import { auth } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/social-callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          throw redirect({ to: "/auth" });
        }

        const { user } = session;

        const accountAgeInMs = Date.now() - new Date(user.createdAt).getTime();
        const isNewUser = accountAgeInMs < 15000;

        console.log("[social-callback] isNewUser:", isNewUser);

        // 3. Redirect accordingly
        if (isNewUser) {
          console.log("[social-callback] Redirecting to sign-up forms");
          throw redirect({ to: "/auth/sign-up/user-data" });
        } else {
          console.log("[social-callback] Redirecting to dashboard");
          throw redirect({ to: "/dashboard" });
        }
      },
    },
  },
});
