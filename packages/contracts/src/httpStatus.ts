/** Standard HTTP status codes used by the Trading Signal API (client + server). */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  NOT_IMPLEMENTED: 501,
} as const

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]

const HTTP_STATUS_VALUES = Object.values(HTTP_STATUS) as HttpStatusCode[]

/** RFC-style short reason phrases for each supported status code. */
export const HTTP_STATUS_REASON: Record<HttpStatusCode, string> = {
  [HTTP_STATUS.OK]: 'OK',
  [HTTP_STATUS.CREATED]: 'Created',
  [HTTP_STATUS.NO_CONTENT]: 'No Content',
  [HTTP_STATUS.BAD_REQUEST]: 'Bad Request',
  [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
  [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
  [HTTP_STATUS.NOT_FOUND]: 'Not Found',
  [HTTP_STATUS.CONFLICT]: 'Conflict',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HTTP_STATUS.BAD_GATEWAY]: 'Bad Gateway',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [HTTP_STATUS.NOT_IMPLEMENTED]: 'Not Implemented',
}

/**
 * What each status means in this app — use when logging or surfacing API errors.
 * 409 Conflict: duplicate alert symbol, max alerts reached, duplicate watchlist name,
 * or email already registered.
 */
export const HTTP_STATUS_IN_APP: Record<HttpStatusCode, string> = {
  [HTTP_STATUS.OK]: 'Request succeeded.',
  [HTTP_STATUS.CREATED]: 'Resource created (user, alert, watchlist, or saved stock).',
  [HTTP_STATUS.NO_CONTENT]: 'Success with no response body (for example, after delete).',
  [HTTP_STATUS.BAD_REQUEST]: 'Invalid input or missing route/body parameter.',
  [HTTP_STATUS.UNAUTHORIZED]: 'Missing or invalid session; sign in required.',
  [HTTP_STATUS.FORBIDDEN]: 'Upstream market-data provider denied the request.',
  [HTTP_STATUS.NOT_FOUND]: 'Resource not found or not owned by the signed-in user.',
  [HTTP_STATUS.CONFLICT]:
    'Business rule conflict: duplicate alert symbol, max alerts reached, duplicate watchlist name, or email already registered.',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Upstream market-data rate limit reached.',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Unexpected server error.',
  [HTTP_STATUS.BAD_GATEWAY]: 'Upstream dependency failed (market data quote or Google OAuth).',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]:
    'Feature or dependency unavailable (market data not configured or alerts-runner dev trigger disabled).',
  [HTTP_STATUS.NOT_IMPLEMENTED]: 'Endpoint or provider capability is not implemented.',
}

/** Returns true when value is one of the supported HTTP status codes. */
export function isHttpStatusCode(value: number): value is HttpStatusCode {
  return HTTP_STATUS_VALUES.includes(value as HttpStatusCode)
}

/** Returns the in-app description for a status code. */
export function describeHttpStatus(status: HttpStatusCode): string {
  return HTTP_STATUS_IN_APP[status]
}

/** Returns the RFC reason phrase for a status code. */
export function httpStatusReason(status: HttpStatusCode): string {
  return HTTP_STATUS_REASON[status]
}
