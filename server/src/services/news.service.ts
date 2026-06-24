import { env } from "../config/env.js";
import { log } from "../lib/logger.js";
import { redis } from "../config/redis.js";
import { parseProcessedNewsArticles } from "../lib/parseNews.js";
import { getWatchlistSymbolsForUser } from "../services/watchlist.service.js";
import {
  fetchLatestMarketNewsArticles,
  markIncomingArticlesAsSeen,
} from "../services/news-ingest.service.js";
import type { IncomingNewsArticle, ProcessedNewsArticle } from "../types/news.js";
import type { NewsSentiment } from "../types/stock.js";

const POSITIVE_KEYWORDS = ["surge", "growth", "profit", "upgrade", "bullish", "success"] as const;
const NEGATIVE_KEYWORDS = [
  "plummet",
  "drop",
  "lawsuit",
  "losses",
  "bearish",
  "risk",
  "inflation",
] as const;

/** Scores headline text and maps the result to a sentiment label. */
function analyzeHeadlineSentiment(headline: string): NewsSentiment {
  const text = headline.toLowerCase();

  const positiveScore = POSITIVE_KEYWORDS.reduce(
    (score, keyword) => (text.includes(keyword) ? score + 1 : score),
    0,
  );
  const negativeScore = NEGATIVE_KEYWORDS.reduce(
    (score, keyword) => (text.includes(keyword) ? score + 1 : score),
    0,
  );

  const netScore = positiveScore - negativeScore;

  if (netScore > 0) {
    return "POSITIVE";
  }

  if (netScore < 0) {
    return "NEGATIVE";
  }

  return "NEUTRAL";
}

/** Reads processed dashboard news from Redis, or null on miss. */
async function readProcessedNewsFromRedis(): Promise<ProcessedNewsArticle[] | null> {
  try {
    const cached = await redis.get(env.dashboardNewsRedisKey);

    if (!cached) {
      return null;
    }

    return parseProcessedNewsArticles(JSON.parse(cached));
  } catch (error) {
    log.error("Failed to read processed news from Redis", error, {
      key: env.dashboardNewsRedisKey,
    });
    return null;
  }
}

/** Maps an incoming article to a processed dashboard article. */
function processIncomingArticle(article: IncomingNewsArticle): ProcessedNewsArticle {
  return {
    headline: article.title,
    url: article.url,
    source: article.source,
    publishedAt: article.publishedAt,
    sentiment: analyzeHeadlineSentiment(article.title),
    symbol: article.symbol,
  };
}

/** Filters articles to symbols on the user's watchlists when any exist. */
function filterNewsByWatchlistSymbols(
  articles: ProcessedNewsArticle[],
  watchlistSymbols: string[],
): ProcessedNewsArticle[] {
  if (watchlistSymbols.length === 0) {
    return articles;
  }

  const allowed = new Set(watchlistSymbols);
  const filtered = articles.filter((article) => allowed.has(article.symbol));

  return filtered.length > 0 ? filtered : articles;
}

/** Fetches market news from Twelve Data, processes it, and caches the feed. */
async function refreshProcessedNewsFromApi(): Promise<ProcessedNewsArticle[]> {
  log.warn("Cache miss for dynamic data, fetching from external provider", {
    key: env.dashboardNewsRedisKey,
  });

  const incomingArticles = await fetchLatestMarketNewsArticles();
  const processedArticles = incomingArticles
    .map((article) => processIncomingArticle(article))
    .slice(0, env.newsMaxArticles);

  await saveProcessedNewsToRedis(processedArticles);
  await markIncomingArticlesAsSeen(incomingArticles);

  return processedArticles;
}

/** Persists the processed news feed back to Redis. */
async function saveProcessedNewsToRedis(articles: ProcessedNewsArticle[]): Promise<void> {
  await redis.set(env.dashboardNewsRedisKey, JSON.stringify(articles));
  log.info("Cached dashboard news list in Redis", {
    key: env.dashboardNewsRedisKey,
    articleCount: articles.length,
  });
}

/** Processes market news articles and serves the dashboard feed from Redis. */
export class NewsService {
  /** Scans a headline for bullish/bearish keywords and returns sentiment. */
  analyzeSentiment(headline: string): NewsSentiment {
    return analyzeHeadlineSentiment(headline);
  }

  /** Returns the dashboard news feed from Redis, fetching from the API on cache miss. */
  async getProcessedNews(): Promise<ProcessedNewsArticle[]> {
    const cachedArticles = await readProcessedNewsFromRedis();

    if (cachedArticles) {
      return cachedArticles;
    }

    return refreshProcessedNewsFromApi();
  }

  /** Returns news filtered to the user's watchlist symbols when available. */
  async getProcessedNewsForUser(userId: string): Promise<ProcessedNewsArticle[]> {
    const [articles, watchlistSymbols] = await Promise.all([
      this.getProcessedNews(),
      getWatchlistSymbolsForUser(userId),
    ]);

    return filterNewsByWatchlistSymbols(articles, watchlistSymbols);
  }

  /** Scores, prepends, trims, and stores an incoming news article. */
  async processIncomingNewsArticle(article: IncomingNewsArticle): Promise<ProcessedNewsArticle> {
    const processedArticle = processIncomingArticle(article);

    const existingArticles = (await readProcessedNewsFromRedis()) ?? [];
    const updatedArticles = [processedArticle, ...existingArticles].slice(0, env.newsMaxArticles);

    await saveProcessedNewsToRedis(updatedArticles);

    log.info("Processed incoming news article", {
      headline: processedArticle.headline,
      sentiment: processedArticle.sentiment,
      articleCount: updatedArticles.length,
    });

    return processedArticle;
  }
}

/** Shared news service instance for consumers and HTTP handlers. */
export const newsService = new NewsService();
