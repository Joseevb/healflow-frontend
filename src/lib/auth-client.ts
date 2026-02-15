import { adminClient, inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.PUBLIC_APP_URL,
  plugins: [
    jwtClient(),
    adminClient(),
    inferAdditionalFields<typeof auth>(),
    stripeClient({
      subscription: true,
    }),
  ],
  callbackURL: "/dashboard",
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
