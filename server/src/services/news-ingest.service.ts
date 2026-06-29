import { env } from "../config/env.js";
import { redis } from "../config/redis.js";
import { getMarketDataProvider } from "../providers/marketData/index.js";
import { newsService } from "./news.service.js";
import type { IncomingNewsArticle } from "../types/news.js";

export { parseTwelveDataPressRelease } from "../providers/marketData/twelveData/twelveDataProvider.js";

const SEEN_ARTICLE_IDS_KEY = "news-ingest:seen-ids";

/** Builds a stable article id from headline metadata when URL has no id fragment. */
function buildFallbackArticleId(title: string, publishedAt: string): string {
  return Buffer.from(`${title}:${publishedAt}`).toString("base64url");
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

/** Marks article ids as already ingested so they are not reprocessed. */
export async function markIncomingArticlesAsSeen(articles: IncomingNewsArticle[]): Promise<void> {
  if (articles.length === 0) {
    return;
  }

  const articleIds = articles.map((article) => resolveIncomingNewsArticleId(article));
  await redis.sadd(SEEN_ARTICLE_IDS_KEY, ...articleIds);
}

/** Returns true when the article id was already processed into the dashboard feed. */
async function wasArticleIngested(articleId: string): Promise<boolean> {
  const seen = await redis.sismember(SEEN_ARTICLE_IDS_KEY, articleId);
  return seen === 1;
}

/** Marks an article id as ingested to avoid duplicate processing. */
async function markArticleIngested(articleId: string): Promise<void> {
  await redis.sadd(SEEN_ARTICLE_IDS_KEY, articleId);
}

/** Fetches the latest market news articles from the configured provider. */
export async function fetchLatestMarketNewsArticles(): Promise<IncomingNewsArticle[]> {
  return fetchMarketNewsArticlesForSymbols(env.newsIngestSymbols);
}

/** Fetches market news for an explicit symbol list (used for rotated refresh batches). */
export async function fetchMarketNewsArticlesForSymbols(
  symbols: readonly string[],
): Promise<IncomingNewsArticle[]> {
  if (symbols.length === 0) {
    return [];
  }

  return getMarketDataProvider().fetchNewsArticles(symbols);
}

/** Fetches unseen articles and writes them into the dashboard news feed. */
export async function ingestLatestNews(): Promise<number> {
  const articles = await fetchLatestMarketNewsArticles();
  let ingestedCount = 0;

  for (const article of articles) {
    const articleId = resolveIncomingNewsArticleId(article);

    if (await wasArticleIngested(articleId)) {
      continue;
    }

    await newsService.processIncomingNewsArticle(article);
    await markArticleIngested(articleId);
    ingestedCount += 1;
  }

  return ingestedCount;
}
