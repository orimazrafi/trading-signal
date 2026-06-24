import axios from "axios";
import { env } from "../config/env.js";
import { redis } from "../config/redis.js";
import { log } from "../lib/logger/index.js";
import {
  buildTwelveDataApiUrl,
  buildTwelveDataPressReleaseArticleUrl,
  requireTwelveDataApiKey,
  TWELVE_DATA_ENDPOINTS,
} from "../lib/twelveData.js";
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
  return buildTwelveDataApiUrl(TWELVE_DATA_ENDPOINTS.pressReleases, {
    symbol,
    outputsize: String(env.newsIngestBatchSize),
    apikey: apiKey,
  });
}

/** Maps a Twelve Data press release to an incoming queue article. */
function mapPressRelease(symbol: string, release: TwelveDataPressRelease): IncomingNewsArticle {
  return {
    title: release.title,
    url: buildTwelveDataPressReleaseArticleUrl(symbol, release.id),
    source: `Twelve Data · ${symbol}`,
    publishedAt: release.datetime,
    symbol,
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
export function resolveIncomingNewsArticleId(article: IncomingNewsArticle): string {
  if (article.url.includes("#")) {
    const fragment = article.url.split("#").pop()?.trim();
    if (fragment) {
      return fragment;
    }
  }

  return buildFallbackArticleId(article.title, article.publishedAt);
}

/** Marks article ids as already ingested so the queue is not republished. */
export async function markIncomingArticlesAsSeen(articles: IncomingNewsArticle[]): Promise<void> {
  if (articles.length === 0) {
    return;
  }

  const articleIds = articles.map((article) => resolveIncomingNewsArticleId(article));
  await redis.sadd(SEEN_ARTICLE_IDS_KEY, ...articleIds);
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
  const apiKey = requireTwelveDataApiKey();

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
    const articleId = resolveIncomingNewsArticleId(article);

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
