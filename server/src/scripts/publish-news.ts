import { redis } from "../config/redis.js";
import { log } from "../lib/logger.js";
import { closeRabbitConnection, connectRabbitMq } from "../queue/rabbit/connection.js";
import { ingestLatestNews } from "../services/news-ingest.service.js";

/** Runs a one-shot news ingest and publishes unseen articles to RabbitMQ. */
async function main(): Promise<void> {
  await redis.connect();
  await connectRabbitMq();

  const publishedCount = await ingestLatestNews();
  log.info("One-shot news ingest completed", { publishedCount });

  await closeRabbitConnection();
  await redis.quit();
}

main().catch((error) => {
  log.error("One-shot news ingest failed", error);
  process.exit(1);
});
