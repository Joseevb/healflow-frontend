import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { Effect } from "effect";

import { useSignUpSession } from "./session";
import { auth } from "@/lib/auth";
import { apiKeyConfig } from "@/lib/api-key.config";
import { UserSyncService } from "@/services/user-sync.service";
import { validateUser } from "@/client/sdk.gen";
import { attempt } from "@/lib/attempt";

/**
 * Checks if the current user is new (not yet provisioned in backend).
 * For social sign-on users, validates against the backend API.
 */
export const checkIsNewUser = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await useSignUpSession();

  // Get current session to check user ID
  const authSession = await auth.api.getSession({ headers });

  // authSession is null if no session, otherwise has user
  if (authSession === null) {
    // No authenticated user
    return { isNewUser: false };
  }

  const userId = authSession.user.id;
  const userName = authSession.user.name || "";
  const userEmail = authSession.user.email;

  // Check if user exists in the backend API
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

  // Determine if user is new (not provisioned in backend)
  let isNewUser = false;

  if (validationError) {
    // Validation call failed - assume new user
    console.log("[checkIsNewUser] Validation call failed, assuming new user");
    isNewUser = true;
  } else if (validationResult.response.status === 400) {
    // 400 means user ID not found in backend
    console.log("[checkIsNewUser] User not found in backend (400)");
    isNewUser = true;
  } else if (validationResult.response.status !== 200) {
    // Any non-200/non-400 status - assume new user to be safe
    console.log("[checkIsNewUser] Unexpected status:", validationResult.response.status);
    isNewUser = true;
  }

  if (isNewUser) {
    // Set up sign-up session for the new social user
    await session.update({
      state: "social-sign-on",
      createdUserId: userId,
      accountData: {
        email: userEmail,
        firstName: userName.split(" ")[0] || "",
        lastName: userName.split(" ").slice(1).join(" ") || "",
      },
    });
  }

  console.log("[checkIsNewUser] User:", userId, "isNewUser:", isNewUser);

  return { isNewUser };
});

/**
 * Gets the current user session on the server side.
 * This properly forwards request headers to access cookies.
 */
export const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  console.log("[getServerSession] Session data:", JSON.stringify(session, null, 2));

  return session;
});

/**
 * Gets a JWT token for the current authenticated user.
 * Used to authenticate API requests to the backend.
 */
export const getJwtToken = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();

  try {
    console.log("[getJwtToken] Requesting JWT token...");

    const tokenResponse = await auth.api.getToken({
      headers,
    });

    console.log("[getJwtToken] Token response:", {
      hasToken: !!tokenResponse.token,
    });

    return tokenResponse.token;
  } catch (error) {
    console.error("[getJwtToken] Error getting JWT token:", error);
    return undefined;
  }
});

/**
 * Syncs users between Better Auth and the backend API.
 * Validates all user IDs and removes stale users that don't exist in the backend.
 */
export const syncUsers = createServerFn({ method: "GET" }).handler(async () => {
  const syncService = new UserSyncService(apiKeyConfig);

  const result = await Effect.runPromise(
    syncService.sync().pipe(
      Effect.catchAll((err) => {
        console.error("[UserSync] Sync failed:", err.message);
        return Effect.succeed({ validated: 0, deleted: 0, error: err.message });
      }),
    ),
  );

  return result;
});
