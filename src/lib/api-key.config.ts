import { TaggedError } from "effect/Data";
import { Effect } from "effect";

export interface ApiKeyConfig {
  getKey: () => Effect.Effect<string, ApiKeyNotSetError, never>;
  getHeaderName: () => Effect.Effect<string, ApiKeyHeaderNotSetError, never>;
}

class ApiKeyNotSetError extends TaggedError("ApiKeyNotSetError") {}
class ApiKeyHeaderNotSetError extends TaggedError("ApiKeyHeaderNotSetError") {}

export const apiKeyConfig: ApiKeyConfig = {
  getKey: () =>
    Effect.gen(function* () {
      if (process.env.API_SERVICE_KEY) {
        return yield* Effect.succeed(process.env.API_SERVICE_KEY);
      }

      return yield* Effect.fail(new ApiKeyNotSetError());
    }),
  getHeaderName: () =>
    Effect.gen(function* () {
      if (process.env.API_HEADER_NAME) {
        return yield* Effect.succeed(process.env.API_HEADER_NAME);
      }

      return yield* Effect.fail(new ApiKeyHeaderNotSetError());
    }),
};
