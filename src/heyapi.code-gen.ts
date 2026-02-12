import { createClient } from "@hey-api/openapi-ts";

createClient({
  input: process.env.API_DOCS_URL || "http://localhost:8080/v3/api-docs",
  output: "src/client",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    "@hey-api/client-fetch",
    "@tanstack/react-query",
  ],
});
