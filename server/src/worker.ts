import { connectWorkerInfrastructure } from "./config/bootstrap.js";
import { prisma } from "./config/prisma.js";
import { redis } from "./config/redis.js";
import { startAlertsJob, stopAlertsJob } from "./jobs/alerts.job.js";
import { startNewsIngestJob, stopNewsIngestJob } from "./jobs/news-ingest.job.js";
import {
  startRecommendationsJob,
  stopRecommendationsJob,
} from "./jobs/recommendations.job.js";
import { log } from "./lib/logger/index.js";

/** Boots infrastructure connections and starts background jobs. */
async function startWorker(): Promise<void> {
  await connectWorkerInfrastructure();

  startNewsIngestJob();
  startRecommendationsJob();
  startAlertsJob();
  log.info("News, recommendations, and alert evaluation workers are running");
}

/** Gracefully closes cache and database connections. */
async function shutdown(): Promise<void> {
  log.info("Shutting down...");
  stopNewsIngestJob();
  stopRecommendationsJob();
  stopAlertsJob();
  try {
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
