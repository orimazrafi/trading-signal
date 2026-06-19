import type { AuthenticatedUser } from "../types/auth.js";
import { env } from "../config/env.js";
import { ensureUserExists } from "../repositories/user.repository.js";

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validates decoded JWT claims and maps them to an authenticated user. */
export function parseJwtUser(decoded: unknown): AuthenticatedUser | null {
  if (typeof decoded === "string" || !isRecord(decoded)) {
    return null;
  }

  const { userId, email } = decoded;

  if (typeof userId !== "string" || typeof email !== "string") {
    return null;
  }

  return { userId, email };
}

/** Ensures the default mock user exists for local and demo environments. */
export async function ensureDefaultUser(): Promise<void> {
  await ensureUserExists(env.mockUser.userId, env.mockUser.email);
}

/** Resolves the authenticated user from a JWT or falls back to the mock user. */
export function resolveAuthenticatedUser(decoded: unknown): AuthenticatedUser {
  return parseJwtUser(decoded) ?? env.mockUser;
}
