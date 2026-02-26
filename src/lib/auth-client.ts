import { adminClient, inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";
import { ac, admin, specialist, user } from "@/lib/auth";
import type { auth } from "@/lib/auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_PUBLIC_APP_URL,
  plugins: [
    jwtClient(),
    adminClient({
      ac,
      roles: {
        user,
        admin,
        specialist,
      },
    }),
    inferAdditionalFields<typeof auth>(),
    stripeClient({
      subscription: true,
    }),
    tanstackStartCookies(),
  ],
  callbackURL: "/dashboard",
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
