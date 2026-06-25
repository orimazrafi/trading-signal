import type { Prisma, User } from "@prisma/client";
import { prisma } from "../config/prisma.js";

/** Builds a user update payload for a Google profile picture URL when one is present. */
function buildPictureUrlUpdate(pictureUrl: string | null): Prisma.UserUpdateInput {
  if (!pictureUrl) {
    return {};
  }

  return { pictureUrl };
}

/** Builds create data for a Google user, including picture URL when available. */
function buildGoogleUserCreateData(
  email: string,
  googleId: string,
  pictureUrl: string | null,
): Prisma.UserUncheckedCreateInput {
  if (!pictureUrl) {
    return { email, googleId };
  }

  return { email, googleId, pictureUrl };
}

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
export async function linkGoogleAccount(
  userId: string,
  googleId: string,
  pictureUrl: string | null,
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      googleId,
      ...buildPictureUrlUpdate(pictureUrl),
    },
  });
}

/** Creates a Google-only user or links an existing email account. */
export async function upsertGoogleUser(
  googleId: string,
  email: string,
  pictureUrl: string | null,
): Promise<User> {
  const existingByGoogle = await prisma.user.findUnique({
    where: { googleId },
    select: { id: true },
  });

  if (existingByGoogle) {
    if (pictureUrl) {
      return prisma.user.update({
        where: { id: existingByGoogle.id },
        data: buildPictureUrlUpdate(pictureUrl),
      });
    }

    return prisma.user.findUniqueOrThrow({ where: { id: existingByGoogle.id } });
  }

  const existingByEmail = await findUserByEmail(email);
  if (existingByEmail) {
    return linkGoogleAccount(existingByEmail.id, googleId, pictureUrl);
  }

  return prisma.user.create({
    data: buildGoogleUserCreateData(email, googleId, pictureUrl),
  });
}

/** Maps a database user row to an authenticated user payload. */
export function toAuthenticatedUser(user: {
  id: string;
  email: string;
  pictureUrl?: string | null;
}): { userId: string; email: string; pictureUrl?: string | null } {
  return {
    userId: user.id,
    email: user.email,
    pictureUrl: user.pictureUrl ?? null,
  };
}