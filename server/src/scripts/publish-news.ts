import { connectWorkerInfrastructure } from "../config/bootstrap.js";
import { redis } from "../config/redis.js";
import { log } from "../lib/logger/index.js";
import { ingestLatestNews } from "../services/news-ingest.service.js";

/** Runs a one-shot news ingest and writes unseen articles to the dashboard feed. */
async function main(): Promise<void> {
  await connectWorkerInfrastructure();

  const ingestedCount = await ingestLatestNews();
  log.info("One-shot news ingest completed", { ingestedCount });

  await redis.quit();
}

main().catch((error) => {
  log.error("One-shot news ingest failed", error);
  process.exit(1);
});
