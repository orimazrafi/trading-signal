import axios from "axios";
import { env } from "../config/env.js";
import { redis } from "../config/redis.js";
import { log } from "../lib/logger.js";
import { publishNewsArticle } from "../queue/publishers/news.publisher.js";
import type { IncomingNewsArticle } from "../types/news.js";

const SEEN_ARTICLE_IDS_KEY = "news-ingest:seen-ids";

type TwelveDataPressRelease = {
  id: string;
  datetime: string;
  title: string;
};

type TwelveDataPressReleasesResponse = {
  status?: string;
  press_releases?: TwelveDataPressRelease[];
  code?: number;
  message?: string;
};

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Builds a stable article id from headline metadata when URL has no id fragment. */
function buildFallbackArticleId(title: string, publishedAt: string): string {
  return Buffer.from(`${title}:${publishedAt}`).toString("base64url");
}

/** Builds a Twelve Data press releases URL for a symbol. */
function buildPressReleasesUrl(symbol: string, apiKey: string): string {
  const params = new URLSearchParams({
    symbol,
    outputsize: String(env.newsIngestBatchSize),
    apikey: apiKey,
  });

  return `https://api.twelvedata.com/press_releases?${params.toString()}`;
}

/** Maps a Twelve Data press release to an incoming queue article. */
function mapPressRelease(symbol: string, release: TwelveDataPressRelease): IncomingNewsArticle {
  return {
    title: release.title,
    url: `https://twelvedata.com/press_releases?symbol=${encodeURIComponent(symbol)}#${encodeURIComponent(release.id)}`,
    source: `Twelve Data · ${symbol}`,
    publishedAt: release.datetime,
  };
}

/** Fetches press releases for a single symbol from Twelve Data. */
async function fetchPressReleasesForSymbol(
  symbol: string,
  apiKey: string,
): Promise<IncomingNewsArticle[]> {
  const { data } = await axios.get<TwelveDataPressReleasesResponse>(
    buildPressReleasesUrl(symbol, apiKey),
    { timeout: 10_000 },
  );

  if (data.code || data.status === "error") {
    throw new Error(data.message ?? `Twelve Data press releases failed for ${symbol}`);
  }

  return (data.press_releases ?? []).map((release) => mapPressRelease(symbol, release));
}

/** Resolves a stable dedupe id for an incoming article. */
function resolveArticleId(article: IncomingNewsArticle): string {
  if (article.url.includes("#")) {
    const fragment = article.url.split("#").pop()?.trim();
    if (fragment) {
      return fragment;
    }
  }

  return buildFallbackArticleId(article.title, article.publishedAt);
}

/** Returns true when the article id was already published to the queue. */
async function wasArticlePublished(articleId: string): Promise<boolean> {
  const seen = await redis.sismember(SEEN_ARTICLE_IDS_KEY, articleId);
  return seen === 1;
}

/** Marks an article id as published to avoid duplicate queue messages. */
async function markArticlePublished(articleId: string): Promise<void> {
  await redis.sadd(SEEN_ARTICLE_IDS_KEY, articleId);
}

/** Fetches the latest market news articles from Twelve Data. */
export async function fetchLatestMarketNewsArticles(): Promise<IncomingNewsArticle[]> {
  const apiKey = env.twelveDataApiKey?.trim();

  if (!apiKey) {
    throw new Error("TWELVE_DATA_API_KEY missing; cannot ingest market news");
  }

  const articles: IncomingNewsArticle[] = [];

  for (const symbol of env.newsIngestSymbols) {
    try {
      const symbolArticles = await fetchPressReleasesForSymbol(symbol, apiKey);
      articles.push(...symbolArticles);
    } catch (error) {
      log.error("External API fetch failed", error, { provider: "Twelve Data", symbol });
    }
  }

  return articles.sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}

/** Publishes unseen articles to RabbitMQ and returns the number queued. */
export async function ingestLatestNews(): Promise<number> {
  const articles = await fetchLatestMarketNewsArticles();
  let publishedCount = 0;

  for (const article of articles) {
    const articleId = resolveArticleId(article);

    if (await wasArticlePublished(articleId)) {
      continue;
    }

    await publishNewsArticle(article);
    await markArticlePublished(articleId);
    publishedCount += 1;
  }

  return publishedCount;
}

/** Validates a Twelve Data press release row at runtime. */
export function parseTwelveDataPressRelease(value: unknown): TwelveDataPressRelease | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, datetime, title } = value;

  if (typeof id !== "string" || typeof datetime !== "string" || typeof title !== "string") {
    return null;
  }

  return { id, datetime, title };
}
