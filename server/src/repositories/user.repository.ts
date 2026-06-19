import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

/** Creates the user row if missing (by primary key). */
export async function ensureUserExists(
  id: string,
  email: string,
): Promise<void> {
  const create: Prisma.UserUncheckedCreateInput = { id, email };

  await prisma.user.upsert({
    where: { id },
    update: { email },
    create,
  });
}
