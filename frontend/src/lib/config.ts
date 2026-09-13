/**
 * Centralised runtime configuration.
 *
 * All values come from NEXT_PUBLIC_* env vars so they are available at
 * build-time AND in the browser.
 */

/** Base URL of the FastAPI backend, e.g. "http://localhost:8000" */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Optional bearer token for the backend API auth middleware. */
export const API_AUTH_TOKEN: string =
  process.env.NEXT_PUBLIC_API_AUTH_TOKEN || "";

/**
 * Build a full URL for a backend API path.
 * e.g. apiUrl("/api/v1/analyze/stream") → "http://localhost:8000/api/v1/analyze/stream"
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/**
 * Build the standard headers object for API requests.
 * Includes Content-Type and optionally Authorization.
 */
export function apiHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (API_AUTH_TOKEN) {
    headers["Authorization"] = `Bearer ${API_AUTH_TOKEN}`;
  }
  return headers;
}
