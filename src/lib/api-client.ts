import { client } from "@/client/client.gen";
import { createServerOnlyFn } from "@tanstack/react-start";

const API_KEY_ENDPOINTS = ["/api/v1/specialists", "/api/v1/user-provisions"] as const;

function requiresApiKey(url: string): boolean {
  return API_KEY_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

export const configureApiKeyInterceptor = createServerOnlyFn(() => {
  const apiKey = process.env.API_SERVICE_KEY;
  const headerName = process.env.API_HEADER_NAME || "X-API-KEY";

  if (!apiKey) {
    console.warn("[API Client] API_SERVICE_KEY not found in environment");
    return;
  }

  client.interceptors.request.use((request) => {
    if (requiresApiKey(request.url)) {
      request.headers.set(headerName, apiKey);
      console.log(`[API Client] ✓ API key added for: ${request.url}`);
    }
    return request;
  });

  console.log("[API Client] API key interceptor configured");
});
