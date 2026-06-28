/** Current REST API version segment (e.g. "v1"). */
export const API_VERSION = "v1" as const;

/** Versioned API mount prefix (e.g. "/api/v1"). */
export const API_BASE_PATH = `/api/${API_VERSION}` as const;

/** Builds a versioned API path from a resource segment (with or without leading slash). */
export function buildApiPath(resourcePath: string): string {
  const normalizedResource = resourcePath.startsWith("/") ? resourcePath : `/${resourcePath}`;

  return `${API_BASE_PATH}${normalizedResource}`;
}

/** Builds a full callback URL for OAuth redirects using the versioned API prefix. */
export function buildDefaultGoogleCallbackUrl(origin: string): string {
  const normalizedOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;

  return `${normalizedOrigin}${buildApiPath("/auth/google/callback")}`;
}
