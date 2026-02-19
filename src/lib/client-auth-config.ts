import { client } from "@/client/client.gen";
import { configureApiKeyInterceptor } from "@/lib/api-client.server";

// Configure API key interceptor for server-side requests
configureApiKeyInterceptor();

// Token storage - can be set before requests are made
let cachedToken: string | undefined = undefined;

/**
 * Set the JWT token for API requests.
 * Call this before making any authenticated API requests.
 */
export function setAuthToken(token: string | undefined): void {
  cachedToken = token;
  if (token) {
    console.log("[Auth] Token set successfully");
  } else {
    console.log("[Auth] Token cleared");
  }
}

/**
 * Get the current cached token.
 */
export function getAuthToken(): string | undefined {
  return cachedToken;
}

/**
 * Clear the cached token.
 */
export function clearAuthToken(): void {
  cachedToken = undefined;
  console.log("[Auth] Token cache cleared");
}

/**
 * Check if a token is available.
 */
export function hasAuthToken(): boolean {
  return !!cachedToken;
}

client.interceptors.request.use((request) => {
  if (cachedToken) {
    request.headers.set("Authorization", `Bearer ${cachedToken}`);
  }
  return request;
});

client.interceptors.response.use((response, request) => {
  if (!response.ok) {
    // Special handling for 401 - authentication issues
    if (response.status === 401) {
      console.error(`[Auth] 401 Unauthorized for: ${request.url}`);
      clearAuthToken();
    }
  }
  return response;
});

client.interceptors.error.use((error) => {
  console.error("[Auth] Client error:", error);
  return error;
});
