import { Effect } from "effect";
import { TaggedError } from "effect/Data";
import { eq } from "drizzle-orm";

import type { ApiKeyConfig } from "@/lib/api-key.config";
import type { ValidationProblemDetail } from "@/client/types.gen";
import { db } from "@/db";
import { accounts, sessions, users } from "@/db/schemas/auth-schema";
import { validateUser } from "@/client/sdk.gen";

export class UserSyncError extends TaggedError("UserSyncError")<{
  message?: string;
}> {}

export class UserSyncService {
  #apiKeyConfig: ApiKeyConfig;

  constructor(apiKeyConfig: ApiKeyConfig) {
    this.#apiKeyConfig = apiKeyConfig;
  }

  /**
   * Gets all user IDs from the Better Auth database
   */
  getAllUserIds(): Effect.Effect<Array<string>, UserSyncError> {
    return Effect.tryPromise({
      try: async () => {
        const allUsers = await db.select({ id: users.id }).from(users);
        return allUsers.map((user) => user.id);
      },
      catch: (err) => {
        const message = err instanceof Error ? err.message : String(err);
        return new UserSyncError({ message: `Failed to fetch users: ${message}` });
      },
    });
  }

  /**
   * Validates user IDs against the backend API
   * Returns the list of invalid user IDs that don't exist in the backend
   */
  validateUsers(userIds: Array<string>): Effect.Effect<Array<string>, UserSyncError> {
    const apiKeyConfig = this.#apiKeyConfig;

    return Effect.gen(function* () {
      if (userIds.length === 0) {
        return [];
      }

      const apiKey = yield* apiKeyConfig
        .getKey()
        .pipe(
          Effect.mapError((err) => new UserSyncError({ message: `API key error: ${err._tag}` })),
        );

      const headerName = yield* apiKeyConfig
        .getHeaderName()
        .pipe(
          Effect.mapError((err) => new UserSyncError({ message: `API header error: ${err._tag}` })),
        );

      const result = yield* Effect.tryPromise({
        try: async () => {
          const response = await validateUser({
            body: { ids: userIds },
            headers: {
              [headerName]: apiKey,
            },
          });

          return response;
        },
        catch: (err) => {
          const message = err instanceof Error ? err.message : String(err);
          return new UserSyncError({ message: `Validation request failed: ${message}` });
        },
      });

      // If response is OK (200), all users are valid
      if (result.response.ok) {
        console.log("[UserSync] All users are valid");
        return [];
      }

      // If response is 400, some users are invalid
      if (result.response.status === 400 && result.error) {
        const errorResponse = result.error as ValidationProblemDetail;
        const invalidIds = errorResponse.invalid_ids ?? [];
        console.log(`[UserSync] Found ${invalidIds.length} invalid user(s):`, invalidIds);
        return invalidIds;
      }

      // Handle other error cases
      if (result.error) {
        throw new UserSyncError({
          message: `Unexpected validation error: ${JSON.stringify(result.error)}`,
        });
      }

      return [];
    });
  }

  /**
   * Deletes a user from the Better Auth database along with their sessions and accounts.
   * This ensures the user cannot use existing session cookies to remain authenticated.
   */
  deleteUser(userId: string): Effect.Effect<void, UserSyncError> {
    return Effect.tryPromise({
      try: async () => {
        // Delete sessions first to invalidate any active session cookies
        await db.delete(sessions).where(eq(sessions.userId, userId));
        console.log(`[UserSync] Deleted sessions for user: ${userId}`);

        // Delete accounts (OAuth connections)
        await db.delete(accounts).where(eq(accounts.userId, userId));
        console.log(`[UserSync] Deleted accounts for user: ${userId}`);

        // Finally delete the user
        await db.delete(users).where(eq(users.id, userId));
        console.log(`[UserSync] Deleted user: ${userId}`);
      },
      catch: (err) => {
        const message = err instanceof Error ? err.message : String(err);
        return new UserSyncError({ message: `Failed to delete user ${userId}: ${message}` });
      },
    });
  }

  /**
   * Deletes multiple users from the Better Auth database
   */
  deleteUsers(userIds: Array<string>): Effect.Effect<void, UserSyncError> {
    return Effect.gen(
      function* (this: UserSyncService) {
        for (const userId of userIds) {
          yield* this.deleteUser(userId);
        }
      }.bind(this),
    );
  }

  /**
   * Main sync function: validates all users and removes stale ones
   */
  sync(): Effect.Effect<{ validated: number; deleted: number }, UserSyncError> {
    return Effect.gen(
      function* (this: UserSyncService) {
        console.log("[UserSync] Starting user synchronization...");

        // Get all user IDs from Better Auth database
        const userIds = yield* this.getAllUserIds();
        console.log(`[UserSync] Found ${userIds.length} user(s) in auth database`);

        if (userIds.length === 0) {
          console.log("[UserSync] No users to validate");
          return { validated: 0, deleted: 0 };
        }

        // Validate users against backend API
        const invalidUserIds = yield* this.validateUsers(userIds);

        // Delete invalid users
        if (invalidUserIds.length > 0) {
          console.log(`[UserSync] Removing ${invalidUserIds.length} stale user(s)...`);
          yield* this.deleteUsers(invalidUserIds);
        }

        console.log("[UserSync] Synchronization complete");
        return {
          validated: userIds.length,
          deleted: invalidUserIds.length,
        };
      }.bind(this),
    );
  }
}
