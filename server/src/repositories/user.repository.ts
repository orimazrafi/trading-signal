import type { Prisma, User } from "@prisma/client";
import { prisma } from "../config/prisma.js";

/** Creates the user row if missing (by primary key). */
export async function ensureUserExists(id: string, email: string): Promise<void> {
  const create: Prisma.UserUncheckedCreateInput = { id, email };

  await prisma.user.upsert({
    where: { id },
    update: { email },
    create,
  });
}

/** Finds a user by email address. */
export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

/** Finds a user by email including password hash for credential login. */
export async function findUserByEmailForLogin(email: string): Promise<{
  id: string;
  email: string;
  passwordHash: string | null;
} | null> {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  });
}

/** Finds a user by Google subject id. */
export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { googleId } });
}

/** Creates a new email/password user. */
export async function createUserWithPassword(email: string, passwordHash: string): Promise<User> {
  return prisma.user.create({
    data: { email, passwordHash },
  });
}

/** Links a Google account to an existing user row. */
export async function linkGoogleAccount(userId: string, googleId: string): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { googleId },
  });
}

/** Creates a Google-only user or links an existing email account. */
export async function upsertGoogleUser(googleId: string, email: string): Promise<User> {
  const existingByGoogle = await findUserByGoogleId(googleId);
  if (existingByGoogle) {
    return existingByGoogle;
  }

  const existingByEmail = await findUserByEmail(email);
  if (existingByEmail) {
    return linkGoogleAccount(existingByEmail.id, googleId);
  }

  return prisma.user.create({
    data: { email, googleId },
  });
}

/** Maps a database user row to an authenticated user payload. */
export function toAuthenticatedUser(user: { id: string; email: string }): { userId: string; email: string } {
  return { userId: user.id, email: user.email };
}