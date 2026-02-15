import { createClient } from "@hey-api/openapi-ts";
import { Console, Effect } from "effect";

<<<<<<< Updated upstream
const API_DOCS_URL = process.env.API_DOCS_URL || "http://localhost:8080/v3/api-docs";
const TIMEOUT_MS = 120_000;

const fetchApiDocs = Effect.gen(function* () {
  yield* Console.log(`Fetching API docs from ${API_DOCS_URL}...`);

  const response = yield* Effect.tryPromise({
    try: () =>
      fetch(API_DOCS_URL, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }),
    catch: (error) => new Error(`Fetch failed: ${error}`),
  });

  if (!response.ok) {
    yield* Effect.fail(new Error(`HTTP ${response.status}: ${response.statusText}`));
  }

  const text = yield* Effect.tryPromise({
    try: () => response.text(),
    catch: (error) => new Error(`Failed to read response: ${error}`),
  });

  yield* Console.log("Successfully fetched API docs");
  return text;
});

const program = Effect.gen(function* () {
  const apiDocs = yield* fetchApiDocs;

  const spec = yield* Effect.try({
    try: () => JSON.parse(apiDocs),
    catch: (error) => new Error(`Invalid JSON: ${error}`),
  });

  yield* Console.log("Generating client...");

  yield* Effect.tryPromise({
    try: () =>
      createClient({
        input: spec,
        output: "src/client",
        plugins: [
          "@hey-api/typescript",
          "@hey-api/sdk",
          "@hey-api/client-fetch",
          "@tanstack/react-query",
        ],
      }),
    catch: (error) => new Error(`Client generation failed: ${error}`),
  });

  yield* Console.log("Client generated successfully!");
});

Effect.runPromise(program).catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
=======
createClient({
  input: process.env.API_DOCS_URL || "http://localhost:8080/v3/api-docs",
  output: "src/client",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "@hey-api/client-fetch",
      baseUrl: process.env.API_URL || "http://localhost:8080",
    },
    "@tanstack/react-query",
  ],
>>>>>>> Stashed changes
});
