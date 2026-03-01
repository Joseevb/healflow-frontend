import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, jwt, openAPI } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import Stripe from "stripe";
import { stripe } from "@better-auth/stripe";

import { db } from "@/db";
import { v7 } from "uuid";

import * as schema from "@/db/schemas";
import { ac, admin, specialist, user } from "./auth-roles";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
    usePlural: true,
  }),

  advanced: {
    database: {
      generateId: () => v7(),
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  plugins: [
    jwt({
      jwks: { keyPairConfig: { alg: "RS256" } },
    }),
    openAPI(),
    adminPlugin({
      ac,
      roles: {
        user,
        admin,
        specialist,
      },
      defaultRole: "client",
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "monthly",
            priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
          },
          {
            name: "yearly",
            priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
          },
        ],
      },
    }),
    tanstackStartCookies(),
  ],
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  callbackURL: "/dashboard",
});
