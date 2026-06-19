import { prisma } from "./prisma.js";
import { redis } from "./redis.js";
import { ensureDefaultUser } from "../services/auth.service.js";

/** Connects Redis and PostgreSQL for the API server process. */
export async function connectServerInfrastructure(): Promise<void> {
  let step = "Redis";

  try {
    await redis.connect();
    console.log("[server] Connected to Redis");

    step = "PostgreSQL";
    await prisma.$connect();
    await ensureDefaultUser();
    console.log("[server] Connected to PostgreSQL");
  } catch (error) {
    console.error(`[server] Failed during ${step} setup:`, error);
    process.exit(1);
  }
}

/** Connects Redis and PostgreSQL for the worker process. */
export async function connectWorkerInfrastructure(): Promise<void> {
  let step = "Redis";

  try {
    await redis.connect();
    console.log("[worker] Connected to Redis");

    step = "PostgreSQL";
    await prisma.$connect();
    console.log("[worker] Connected to PostgreSQL");
  } catch (error) {
    console.error(`[worker] Failed during ${step} setup:`, error);
    process.exit(1);
  }
}
