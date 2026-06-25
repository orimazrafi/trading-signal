/** Minimal issue shape from a failed Zod safeParse (version-agnostic). */
export type ApiValidationIssue = {
  message: string;
  path: (string | number)[];
};

/** Successful result from an API schema safeParse. */
export type ApiParseSuccess<T> = {
  success: true;
  data: T;
};

/** Failed result from an API schema safeParse. */
export type ApiParseFailure = {
  success: false;
  error: { issues: ApiValidationIssue[] };
};

/** Result union returned by ApiSchema.safeParse. */
export type ApiParseResult<T> = ApiParseSuccess<T> | ApiParseFailure;

/**
 * Schema accepted by API parsers.
 * Structural type so client and contracts can use different Zod installs at runtime
 * without TypeScript coupling to a specific ZodType definition.
 */
export type ApiSchema<T> = {
  safeParse(value: unknown): ApiParseResult<T>;
};

/** Thrown when an API payload fails Zod validation. */
export class ApiValidationError extends Error {
  readonly resource: string;
  readonly issues: ApiValidationIssue[];

  constructor(resource: string, issues: ApiValidationIssue[]) {
    super(`Invalid ${resource} response from API`);
    this.name = "ApiValidationError";
    this.resource = resource;
    this.issues = issues;
  }
}

/** Validates unknown JSON with a Zod schema; throws ApiValidationError on failure. */
export function parseApiResponse<T>(
  schema: ApiSchema<T>,
  value: unknown,
  resource: string,
): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiValidationError(resource, result.error.issues);
  }

  return result.data;
}

/** Validates unknown JSON with a Zod schema; returns null on failure. */
export function safeParseApiResponse<T>(schema: ApiSchema<T>, value: unknown): T | null {
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
}
