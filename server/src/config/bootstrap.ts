import { startAlertNotificationSubscriber } from "../lib/alertNotificationSubscriber.js";
import { ensureUserExists } from "../repositories/user.repository.js";
import { log } from "../lib/logger/index.js";
import { env } from "./env.js";
import { logGoogleOAuthCredentialStatus } from "./googleOAuthCheck/index.js";
import { prisma } from "./prisma.js";
import { redis } from "./redis.js";

/** Connects Redis and PostgreSQL for the API server process. */
export async function connectServerInfrastructure(): Promise<void> {
  let step = "Redis";

  try {
    await redis.connect();
    log.info("Connected to Redis", { process: "server" });

    step = "PostgreSQL";
    await prisma.$connect();

    if (env.authAllowMock) {
      await ensureUserExists(env.mockUser.userId, env.mockUser.email);
      log.info("Mock user enabled for development", { process: "server" });
    }

    log.info("Connected to PostgreSQL", { process: "server" });

    await startAlertNotificationSubscriber();

    if (env.nodeEnv === "development" && env.googleClientId) {
      await logGoogleOAuthCredentialStatus();
    }
  } catch (error) {
    log.error(`Failed during ${step} setup`, error, { process: "server" });
    process.exit(1);
  }
}

/** Connects Redis and PostgreSQL for the worker process. */
export async function connectWorkerInfrastructure(): Promise<void> {
  let step = "Redis";

  try {
    await redis.connect();
    log.info("Connected to Redis", { process: "worker" });

    step = "PostgreSQL";
    await prisma.$connect();
    log.info("Connected to PostgreSQL", { process: "worker" });
  } catch (error) {
    log.error(`Failed during ${step} setup`, error, { process: "worker" });
    process.exit(1);
  }
}
