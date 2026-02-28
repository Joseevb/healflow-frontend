import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, createAccessControl, jwt, openAPI } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import Stripe from "stripe";
import { stripe } from "@better-auth/stripe";
import { Effect } from "effect";
import { TaggedError } from "effect/Data";

import { v7 } from "uuid";
import { db } from "@/db";

import * as schema from "@/db/schemas";
import { adminAc, defaultStatements } from "better-auth/plugins/organization/access";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";

const statement = {
  specialist: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  ...defaultStatements,
  specialist: ["read"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  specialist: ["create", "read", "update", "delete"],
});

export const specialist = ac.newRole({
  specialist: ["read", "update"],
});

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
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

export class CreateAdminUserError extends TaggedError("CreateAdminUserError")<{
  message: string;
}> {}

const createAdminUser = () =>
  Effect.tryPromise({
    try: async () => {
      const result = await auth.api.signUpEmail({
        body: {
          email: "admin@admin.admin",
          password: "admin12345",
          name: "admin",
        },
      });

      const user = (
        await db
          .update(users)
          .set({ role: "admin" })
          .where(eq(users.id, result.user.id))
          .returning()
      )[0];

      if (user) {
        console.log("Created admin user:", user);
        return user;
      }

      console.log("Admin user already exists");
      return user;
    },
    catch: (err) => {
      const message = err instanceof Error ? err.message : String(err);
      return new CreateAdminUserError({ message });
    },
  });

export function runCreateAdminUser() {
  return Effect.runPromise(createAdminUser());
}
