import { checkIsNewUser } from "@/server/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/social-callback/$userId")({
  server: {
    handlers: {
      GET: async () => {
        const { isNewUser } = await checkIsNewUser();

        console.log("[social-callback] isNewUser:", isNewUser);

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
