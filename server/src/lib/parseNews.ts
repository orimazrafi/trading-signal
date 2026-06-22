import type { IncomingNewsArticle, ProcessedNewsArticle } from "../types/news.js";

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validates an incoming market news message from RabbitMQ. */
export function parseIncomingNewsArticle(payload: unknown): IncomingNewsArticle | null {
  if (!isRecord(payload)) {
    return null;
  }

  const { title, url, source, publishedAt } = payload;

  if (
    typeof title !== "string" ||
    typeof url !== "string" ||
    typeof source !== "string" ||
    typeof publishedAt !== "string"
  ) {
    return null;
  }

  const normalizedTitle = title.trim();
  const normalizedUrl = url.trim();
  const normalizedSource = source.trim();
  const normalizedPublishedAt = publishedAt.trim();

  if (!normalizedTitle || !normalizedUrl || !normalizedSource || !normalizedPublishedAt) {
    return null;
  }

  return {
    title: normalizedTitle,
    url: normalizedUrl,
    source: normalizedSource,
    publishedAt: normalizedPublishedAt,
  };
}

/** Validates a cached processed news array from Redis. */
export function parseProcessedNewsArticles(value: unknown): ProcessedNewsArticle[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const articles: ProcessedNewsArticle[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const { headline, url, source, publishedAt, sentiment } = item;

    if (
      typeof headline !== "string" ||
      typeof url !== "string" ||
      typeof source !== "string" ||
      typeof publishedAt !== "string" ||
      (sentiment !== "POSITIVE" && sentiment !== "NEGATIVE" && sentiment !== "NEUTRAL")
    ) {
      continue;
    }

    articles.push({ headline, url, source, publishedAt, sentiment });
  }

  return articles;
}
