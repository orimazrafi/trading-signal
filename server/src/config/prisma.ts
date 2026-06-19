import { PrismaClient } from "@prisma/client";

/** Shared Prisma client singleton for API and worker processes. */
export const prisma = new PrismaClient();
