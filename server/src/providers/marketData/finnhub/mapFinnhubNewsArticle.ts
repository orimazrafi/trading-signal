import type { IncomingNewsArticle } from "../../../types/news.js";
import type { FinnhubNewsArticle } from "./types.js";

const NEWS_LOOKBACK_DAYS = 30;
const SECONDS_PER_DAY = 86_400;

/** Formats a Finnhub news unix timestamp as ISO-8601. */
export function formatNewsPublishedAt(datetime: number | undefined): string {
  if (typeof datetime !== "number" || !Number.isFinite(datetime)) {
    return new Date().toISOString();
  }

  return new Date(datetime * 1000).toISOString();
}

/** Builds Finnhub company-news `from`/`to` query dates (YYYY-MM-DD). */
export function buildFinnhubNewsDateRange(): { from: string; to: string } {
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - NEWS_LOOKBACK_DAYS * SECONDS_PER_DAY * 1000);

  return {
    from: fromDate.toISOString().slice(0, 10),
    to: toDate.toISOString().slice(0, 10),
  };
}

/** Maps a Finnhub news row to an incoming article, or null when required fields are missing. */
export function mapFinnhubNewsArticle(
  row: FinnhubNewsArticle,
  symbol: string,
): IncomingNewsArticle | null {
  if (!row.headline || !row.url) {
    return null;
  }

  return {
    title: row.headline,
    url: row.url,
    source: row.source ?? "Market",
    publishedAt: formatNewsPublishedAt(row.datetime),
    symbol,
  };
}

/** Sorts news articles newest-first by publishedAt. */
export function sortNewsByPublishedAt(articles: IncomingNewsArticle[]): IncomingNewsArticle[] {
  return [...articles].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}
