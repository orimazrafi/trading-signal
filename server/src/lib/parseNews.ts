import type { IncomingNewsArticle, ProcessedNewsArticle } from "../types/news.js";

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Returns the last segment of a middot-delimited source label, uppercased. */
function extractTrailingSourceSymbol(source: string): string {
  const parts = source.split("·");
  return parts[parts.length - 1]?.trim().toUpperCase() ?? "";
}

/** Extracts a ticker symbol from a Twelve Data source label when missing on older payloads. */
function parseSymbolFromSource(source: string): string | null {
  if (!source.includes("·")) {
    return null;
  }

  const symbol = extractTrailingSourceSymbol(source);

  return symbol.length > 0 ? symbol : null;
}

/** Resolves a news article symbol from an explicit field or the source label. */
function resolveNewsArticleSymbol(symbol: unknown, source: string): string | null {
  if (typeof symbol === "string" && symbol.trim().length > 0) {
    return symbol.trim().toUpperCase();
  }

  return parseSymbolFromSource(source);
}

/** Validates an incoming market news article during ingest. */
export function parseIncomingNewsArticle(payload: unknown): IncomingNewsArticle | null {
  if (!isRecord(payload)) {
    return null;
  }

  const { title, url, source, publishedAt, symbol } = payload;

  if (
    typeof title !== "string" ||
    typeof url !== "string" ||
    typeof source !== "string" ||
    typeof publishedAt !== "string"
  ) {
    return null;
  }

  const normalizedSymbol = resolveNewsArticleSymbol(symbol, source);

  if (!normalizedSymbol) {
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
    symbol: normalizedSymbol,
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

    const { headline, url, source, publishedAt, sentiment, symbol } = item;

    if (
      typeof headline !== "string" ||
      typeof url !== "string" ||
      typeof source !== "string" ||
      typeof publishedAt !== "string" ||
      (sentiment !== "POSITIVE" && sentiment !== "NEGATIVE" && sentiment !== "NEUTRAL")
    ) {
      continue;
    }

    const normalizedSymbol = resolveNewsArticleSymbol(symbol, source);

    if (!normalizedSymbol) {
      continue;
    }

    articles.push({
      headline,
      url,
      source,
      publishedAt,
      sentiment,
      symbol: normalizedSymbol,
    });
  }

  return articles;
}
