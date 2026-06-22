import { redis } from "../config/redis.js";
import { log } from "../lib/logger.js";
import { recommendationService } from "../services/recommendation.service.js";

/** Runs a one-shot recommendations refresh and writes results to Redis. */
async function main(): Promise<void> {
  await redis.connect();

  const recommendations = await recommendationService.refreshRecommendations();
  log.info("One-shot recommendations refresh completed", { count: recommendations.length });

  await redis.quit();
}

main().catch((error) => {
  log.error("One-shot recommendations refresh failed", error);
  process.exit(1);
});
