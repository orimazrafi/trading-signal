import { env } from "../config/env.js";
import { redis } from "../config/redis.js";
import { diversifyNewsArticles } from "../lib/diversifyNewsArticles.js";
import { log } from "../lib/logger/index.js";
import { NewsFeedError } from "../lib/newsError.js";
import { readJsonFromRedis, writeJsonToRedis } from "../lib/redisJsonCache.js";
import { parseProcessedNewsArticles } from "../lib/parseNews.js";
import { rotateNewsIngestSymbols } from "../lib/rotateNewsIngestSymbols.js";
import { getWatchlistSymbolsForUser } from "../services/watchlist.service.js";
import {
  fetchLatestMarketNewsArticles,
  fetchMarketNewsArticlesForSymbols,
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

/** Options for a paginated dashboard news request. */
export type NewsFeedPageOptions = {
  limit: number;
  offset: number;
  refresh: boolean;
};

/** Paginated dashboard news payload returned by the HTTP handler. */
export type NewsFeedPage = {
  news: ProcessedNewsArticle[];
  hasMore: boolean;
  nextOffset: number;
};

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
  return readJsonFromRedis(env.dashboardNewsRedisKey, parseProcessedNewsArticles, {
    key: env.dashboardNewsRedisKey,
  });
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

/** Deduplicates processed articles by URL, keeping the first occurrence. */
function dedupeProcessedArticlesByUrl(
  articles: ProcessedNewsArticle[],
): ProcessedNewsArticle[] {
  const seenUrls = new Set<string>();

  return articles.filter((article) => {
    if (seenUrls.has(article.url)) {
      return false;
    }

    seenUrls.add(article.url);
    return true;
  });
}

/** Increments and returns the refresh rotation counter stored in Redis. */
async function incrementNewsRefreshCount(): Promise<number> {
  return redis.incr(env.dashboardNewsRefreshCountRedisKey);
}

/** Resolves the symbol batch for a provider fetch based on the refresh counter. */
function resolveRotatedNewsSymbols(refreshCount: number): string[] {
  return rotateNewsIngestSymbols(env.newsIngestSymbols, refreshCount);
}

/** Fetches a rotated symbol batch from the provider and merges it into the Redis pool. */
async function fetchAndMergeNewsPool(refreshCount: number): Promise<ProcessedNewsArticle[]> {
  const symbols = resolveRotatedNewsSymbols(refreshCount);
  const incomingArticles = await fetchMarketNewsArticlesForSymbols(symbols);
  const freshProcessed = incomingArticles.map((article) => processIncomingArticle(article));
  const existingArticles = (await readProcessedNewsFromRedis()) ?? [];
  const mergedArticles = dedupeProcessedArticlesByUrl([...freshProcessed, ...existingArticles]);
  const diversifiedArticles = diversifyNewsArticles(mergedArticles, env.newsMaxPoolArticles);

  await saveProcessedNewsToRedis(diversifiedArticles);
  await markIncomingArticlesAsSeen(incomingArticles);

  return diversifiedArticles;
}

/** Fetches market news from the configured provider, processes it, and caches the feed. */
async function refreshProcessedNewsFromApi(): Promise<ProcessedNewsArticle[]> {
  log.warn("Cache miss for dynamic data, fetching from external provider", {
    key: env.dashboardNewsRedisKey,
  });

  const incomingArticles = await fetchLatestMarketNewsArticles();
  const processedArticles = diversifyNewsArticles(
    incomingArticles.map((article) => processIncomingArticle(article)),
    env.newsMaxPoolArticles,
  );

  await saveProcessedNewsToRedis(processedArticles);
  await markIncomingArticlesAsSeen(incomingArticles);

  return processedArticles;
}

/** Persists the processed news feed back to Redis. */
async function saveProcessedNewsToRedis(articles: ProcessedNewsArticle[]): Promise<void> {
  await writeJsonToRedis(env.dashboardNewsRedisKey, articles, {
    ttlSeconds: env.dashboardNewsCacheTtlSeconds,
    logMessage: "Cached dashboard news list in Redis",
    logContext: {
      key: env.dashboardNewsRedisKey,
      articleCount: articles.length,
      ttlSeconds: env.dashboardNewsCacheTtlSeconds,
    },
  });
}

/** Slices a filtered feed and reports whether another page may exist. */
function sliceNewsFeedPage(
  articles: ProcessedNewsArticle[],
  limit: number,
  offset: number,
): NewsFeedPage {
  const page = articles.slice(offset, offset + limit);
  const nextOffset = offset + page.length;

  return {
    news: page,
    hasMore: nextOffset < articles.length,
    nextOffset,
  };
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

    try {
      return await refreshProcessedNewsFromApi();
    } catch (error) {
      log.error("Failed to refresh dashboard news from provider", error, {
        key: env.dashboardNewsRedisKey,
      });
      throw new NewsFeedError("Market news is temporarily unavailable. Please try again shortly.");
    }
  }

  /** Returns a paginated news page, optionally forcing a provider refresh. */
  async getNewsFeedPage(options: NewsFeedPageOptions): Promise<NewsFeedPage> {
    const articles = await this.ensurePoolCoversOffset(await this.resolveNewsPool(options), options);
    return sliceNewsFeedPage(articles, options.limit, options.offset);
  }

  /** Returns a paginated news page filtered to the user's watchlist symbols. */
  async getNewsFeedPageForUser(userId: string, options: NewsFeedPageOptions): Promise<NewsFeedPage> {
    const watchlistSymbols = await getWatchlistSymbolsForUser(userId);
    let poolArticles = await this.resolveNewsPool(options);
    let filteredArticles = filterNewsByWatchlistSymbols(poolArticles, watchlistSymbols);

    if (!options.refresh) {
      while (options.offset >= filteredArticles.length) {
        const previousLength = filteredArticles.length;
        const refreshCount = await incrementNewsRefreshCount();
        poolArticles = await fetchAndMergeNewsPool(refreshCount);
        filteredArticles = filterNewsByWatchlistSymbols(poolArticles, watchlistSymbols);

        if (filteredArticles.length <= previousLength) {
          break;
        }
      }
    }

    return sliceNewsFeedPage(filteredArticles, options.limit, options.offset);
  }

  /** Loads the news pool from cache or provider, forcing a refresh when requested. */
  private async resolveNewsPool(options: NewsFeedPageOptions): Promise<ProcessedNewsArticle[]> {
    try {
      if (options.refresh) {
        const refreshCount = await incrementNewsRefreshCount();
        return await fetchAndMergeNewsPool(refreshCount);
      }

      return await this.getProcessedNews();
    } catch (error) {
      if (error instanceof NewsFeedError) {
        throw error;
      }

      log.error("Failed to resolve dashboard news pool", error, {
        key: env.dashboardNewsRedisKey,
        refresh: options.refresh,
      });
      throw new NewsFeedError("Market news is temporarily unavailable. Please try again shortly.");
    }
  }

  /** Fetches additional provider batches until the pool can satisfy the requested offset. */
  private async ensurePoolCoversOffset(
    articles: ProcessedNewsArticle[],
    options: NewsFeedPageOptions,
  ): Promise<ProcessedNewsArticle[]> {
    if (options.refresh || options.offset < articles.length) {
      return articles;
    }

    let pool = articles;

    while (options.offset >= pool.length) {
      const previousLength = pool.length;
      const refreshCount = await incrementNewsRefreshCount();
      pool = await fetchAndMergeNewsPool(refreshCount);

      if (pool.length <= previousLength) {
        break;
      }
    }

    return pool;
  }

  /** Scores, prepends, trims, and stores an incoming news article. */
  async processIncomingNewsArticle(article: IncomingNewsArticle): Promise<ProcessedNewsArticle> {
    const processedArticle = processIncomingArticle(article);

    const existingArticles = (await readProcessedNewsFromRedis()) ?? [];
    const updatedArticles = dedupeProcessedArticlesByUrl([
      processedArticle,
      ...existingArticles,
    ]).slice(0, env.newsMaxPoolArticles);

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
