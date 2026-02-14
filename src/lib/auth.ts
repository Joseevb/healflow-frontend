import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, jwt, openAPI } from "better-auth/plugins";
import Stripe from "stripe";
import { stripe } from "@better-auth/stripe";

import { v7 } from "uuid";
import { db } from "@/db";

import * as schema from "@/db/schemas";

import { Database } from "bun:sqlite";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const database = new Database(process.env.DB_FILE_NAME!);

export const auth = betterAuth({
  database,
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
    admin(),
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
  ],
  user: { modelName: "users" },
  session: { modelName: "sessions" },
  account: {
    modelName: "accounts",
    accountLinking: {
      enabled: true,
    },
  },
  verification: { modelName: "verifications" },
  callbackURL: "/dashboard",
});
