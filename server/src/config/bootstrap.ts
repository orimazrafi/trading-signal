import { prisma } from "./prisma.js";
import { redis } from "./redis.js";
import { env } from "./env.js";
import { logGoogleOAuthCredentialStatus } from "./googleOAuthCheck.js";
import { ensureUserExists } from "../repositories/user.repository.js";

/** Connects Redis and PostgreSQL for the API server process. */
export async function connectServerInfrastructure(): Promise<void> {
  let step = "Redis";

  try {
    await redis.connect();
    console.log("[server] Connected to Redis");

    step = "PostgreSQL";
    await prisma.$connect();

    if (env.authAllowMock) {
      await ensureUserExists(env.mockUser.userId, env.mockUser.email);
      console.log("[server] Mock user enabled for development");
    }

    console.log("[server] Connected to PostgreSQL");

    if (env.nodeEnv === "development" && env.googleClientId) {
      await logGoogleOAuthCredentialStatus();
    }
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