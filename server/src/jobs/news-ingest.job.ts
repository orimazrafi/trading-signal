/**
 * Repeating worker task for market news.
 *
 * Every N minutes (and once on startup):
 *   1. Fetch press releases from Twelve Data
 *   2. Skip articles we already queued (Redis dedupe)
 *   3. Write new articles into the dashboard Redis feed
 */
import { env } from "../config/env.js";
import { log } from "../lib/logger/index.js";
import { ingestLatestNews } from "../services/news-ingest.service.js";

/** Active interval handle, or null when the job is stopped. */
let pollInterval: ReturnType<typeof setInterval> | null = null;

/** Fetches news and queues any articles we have not seen before. */
async function pollNews(): Promise<void> {
  try {
    const newArticleCount = await ingestLatestNews();

    if (newArticleCount > 0) {
      log.info("Ingested new articles", { count: newArticleCount });
    }
  } catch (error) {
    log.error("News poll failed", error);
  }
}

/** Starts the news ingest job if enabled and not already running. */
export function startNewsIngestJob(): void {
  if (!env.newsIngestEnabled) {
    log.info("News ingest is off (NEWS_INGEST_ENABLED=false)");
    return;
  }

  if (pollInterval) return;

  log.info("News ingest started", {
    symbols: env.newsIngestSymbols.join(", "),
    intervalMinutes: env.newsIngestIntervalMs / 60_000,
  });

  void pollNews();
  pollInterval = setInterval(pollNews, env.newsIngestIntervalMs);
}

/** Stops the repeating news ingest job. */
export function stopNewsIngestJob(): void {
  if (!pollInterval) return;

  clearInterval(pollInterval);
  pollInterval = null;
}
