import { z } from "zod";
import { safeParseApiResponse } from "./lib/zodApi.js";

export const authenticatedUserSchema = z.object({
  userId: z.string(),
  email: z.string(),
  pictureUrl: z.string().url().nullable().optional(),
});

export const authResponseSchema = z.object({
  user: authenticatedUserSchema,
});

export const logoutResponseSchema = z.object({
  ok: z.boolean(),
});

/** Authenticated user returned by auth API endpoints. */
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

/** Response body for auth endpoints that return the session user. */
export type AuthResponse = z.infer<typeof authResponseSchema>;

/** Response body for POST /api/auth/logout. */
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;

/** Validates a parsed JSON value as an auth response. */
export function parseAuthResponse(value: unknown): AuthResponse | null {
  return safeParseApiResponse(authResponseSchema, value);
}
