import { connectWorkerInfrastructure } from "./config/bootstrap.js";
import { prisma } from "./config/prisma.js";
import { redis } from "./config/redis.js";
import { startNewsIngestJob, stopNewsIngestJob } from "./jobs/news-ingest.job.js";
import {
  startRecommendationsJob,
  stopRecommendationsJob,
} from "./jobs/recommendations.job.js";
import { log } from "./lib/logger/index.js";
import { registerAllConsumers } from "./queue/consumers/registerConsumers.js";
import {
  closeRabbitConnection,
  retryRabbitConnection,
  setRabbitReconnectHandler,
} from "./queue/rabbit/connection.js";
import { formatRabbitError, isFatalRabbitError } from "./queue/rabbit/errors.js";

/** Boots infrastructure connections and starts RabbitMQ consumers. */
async function startWorker(): Promise<void> {
  await connectWorkerInfrastructure();
  setRabbitReconnectHandler(registerAllConsumers);

  try {
    await registerAllConsumers();
    startNewsIngestJob();
    startRecommendationsJob();
    log.info("Stock, news, and recommendations workers are running");
  } catch (error) {
    log.error("Failed during consumer startup", error);

    if (isFatalRabbitError(error)) {
      process.exit(1);
    }

    await retryRabbitConnection(formatRabbitError(error));
  }
}

/** Gracefully closes broker, cache, and database connections. */
async function shutdown(): Promise<void> {
  log.info("Shutting down...");
  stopNewsIngestJob();
  stopRecommendationsJob();
  try {
    await closeRabbitConnection();
    await redis.quit();
    await prisma.$disconnect();
  } catch (error) {
    log.error("Shutdown error", error);
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startWorker().catch((error) => {
  log.error("Fatal startup error", error);
  process.exit(1);
});
