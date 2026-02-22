import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { Effect } from "effect";

import { auth } from "@/lib/auth";
import { apiKeyConfig } from "@/lib/api-key.config";
import { UserSyncService } from "@/services/user-sync.service";
import { validateUser } from "@/client/sdk.gen";
import { attempt } from "@/lib/attempt";
import { updateSignUpSession } from "./session";

/**
 * Checks if the current user is new (not yet provisioned in backend).
 * For social sign-on users, validates against the backend API.
 */
export const checkIsNewUser = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();

  // Get current session to check user ID
  const authSession = await auth.api.getSession({ headers });

  // No authenticated user means not a new user in our system
  if (!authSession?.user?.id) {
    return { isNewUser: false };
  }

  const { id: userId, name = "", email } = authSession.user;

  // Validate user exists in backend API
  const { data: validationResult, error: validationError } = await attempt(async () => {
    const apiKey = await Effect.runPromise(apiKeyConfig.getKey());
    const headerName = await Effect.runPromise(apiKeyConfig.getHeaderName());

    return await validateUser({
      body: { ids: [userId] },
      headers: {
        [headerName]: apiKey,
      },
    });
  });

  // Determine if user is new based on validation response
  const isNewUser = determineIfNewUser(validationError, validationResult);

  if (isNewUser) {
    // Set up sign-up session for new social user
    await updateSignUpSession({
      data: {
        state: "social-sign-on",
        createdUserId: userId,
        accountData: {
          email,
          firstName: name.split(" ")[0] ?? "",
          lastName: name.split(" ").slice(1).join(" ") ?? "",
        },
      },
    });
  }

  console.log("[checkIsNewUser]", { userId, isNewUser });

  return { isNewUser };
});

/**
 * Determines if a user is new based on backend validation response
 */
function determineIfNewUser(validationError: unknown, validationResult: any): boolean {
  if (validationError) {
    console.warn("[checkIsNewUser] Validation call failed, assuming new user");
    return true;
  }

  const status = validationResult?.response?.status;

  switch (status) {
    case 200:
      // User found in backend
      return false;
    case 400:
      // User not found in backend
      return true;
    default:
      // Unexpected status, assume new to be safe
      console.warn("[checkIsNewUser] Unexpected validation status:", status);
      return true;
  }
}

/**
 * Gets the current user session on the server side.
 * This properly forwards request headers to access cookies.
 */
export const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  if (session) {
    console.log("[getServerSession] User authenticated:", { userId: session.user.id });
  } else {
    console.log("[getServerSession] No active session");
  }

  return session;
});

/**
 * Gets a JWT token for the current authenticated user.
 * Used to authenticate API requests to the backend.
 */
export const getJwtToken = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();

  try {
    const tokenResponse = await auth.api.getToken({
      headers,
    });

    if (!tokenResponse.token) {
      console.warn("[getJwtToken] No token in response");
      return undefined;
    }

    console.log("[getJwtToken] Token obtained successfully");
    return tokenResponse.token;
  } catch (error) {
    console.error("[getJwtToken] Failed to get JWT token:", error);
    return undefined;
  }
});

/**
 * Syncs users between Better Auth and the backend API.
 * Validates all user IDs and removes stale users that don't exist in the backend.
 */
export const syncUsers = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const syncService = new UserSyncService(apiKeyConfig);

    const result = await Effect.runPromise(
      syncService.sync().pipe(
        Effect.catchAll((err) => {
          console.error("[syncUsers] Sync failed:", err.message);
          return Effect.succeed({ validated: 0, deleted: 0, error: err.message });
        }),
      ),
    );

    console.log("[syncUsers] Completed:", result);
    return result;
  } catch (error) {
    console.error("[syncUsers] Unexpected error:", error);
    return { validated: 0, deleted: 0, error: "Unexpected error during sync" };
  }
});
