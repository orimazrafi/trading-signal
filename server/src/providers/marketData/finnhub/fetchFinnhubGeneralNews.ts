import type { IncomingNewsArticle } from "../../../types/news.js";
import { finnhubGet } from "./client.js";
import { formatNewsPublishedAt } from "./mapFinnhubNewsArticle.js";
import { logFinnhubFetchError } from "./optionalFetch.js";
import type { FinnhubGeneralNewsArticle } from "./types.js";

/** Resolves a ticker symbol from Finnhub's comma-separated related field. */
function resolveRelatedSymbol(related: string | undefined): string {
  const firstSymbol = related?.split(",")[0]?.trim().toUpperCase() ?? "";

  return firstSymbol.length > 0 ? firstSymbol : "MARKET";
}

/** Maps a Finnhub general-news row to an incoming article, or null when required fields are missing. */
function mapFinnhubGeneralNewsArticle(row: FinnhubGeneralNewsArticle): IncomingNewsArticle | null {
  if (!row.headline || !row.url) {
    return null;
  }

  return {
    title: row.headline,
    url: row.url,
    source: row.source ?? "Market",
    publishedAt: formatNewsPublishedAt(row.datetime),
    symbol: resolveRelatedSymbol(row.related),
  };
}

/** Fetches broad market headlines from Finnhub's general news category. */
export async function fetchFinnhubGeneralNews(): Promise<IncomingNewsArticle[]> {
  try {
    const rows = await finnhubGet<FinnhubGeneralNewsArticle[]>("/news", { category: "general" });

    return rows
      .map((row) => mapFinnhubGeneralNewsArticle(row))
      .filter((article): article is IncomingNewsArticle => article !== null);
  } catch (error) {
    logFinnhubFetchError(error, "general", "news");
    return [];
  }
}
