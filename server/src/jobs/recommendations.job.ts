/**
 * Repeating worker task for dashboard stock recommendations.
 *
 * Every N minutes (and once on startup):
 *   1. Fetch quotes for the configured symbol universe
 *   2. Score fundamental + sector factors
 *   3. Cache actionable picks in Redis
 */
import { env } from "../config/env.js";
import { log } from "../lib/logger.js";
import { recommendationService } from "../services/recommendation.service.js";

/** Active interval handle, or null when the job is stopped. */
let pollInterval: ReturnType<typeof setInterval> | null = null;

/** Recomputes recommendations and writes them to Redis. */
async function pollRecommendations(): Promise<void> {
  try {
    const recommendations = await recommendationService.refreshRecommendations();

    if (recommendations.length > 0) {
      log.info("Refreshed recommendations feed", { count: recommendations.length });
    }
  } catch (error) {
    log.error("Recommendations poll failed", error);
  }
}

/** Starts the recommendations refresh job if enabled and not already running. */
export function startRecommendationsJob(): void {
  if (!env.recommendationsEnabled) {
    log.info("Recommendations refresh is off (RECOMMENDATIONS_ENABLED=false)");
    return;
  }

  if (pollInterval) return;

  log.info("Recommendations refresh started", {
    symbols: env.recommendationSymbols.join(", "),
    intervalMinutes: env.recommendationsIntervalMs / 60_000,
  });

  void pollRecommendations();
  pollInterval = setInterval(pollRecommendations, env.recommendationsIntervalMs);
}

/** Stops the repeating recommendations refresh job. */
export function stopRecommendationsJob(): void {
  if (!pollInterval) return;

  clearInterval(pollInterval);
  pollInterval = null;
}
