import type { IncomingNewsArticle } from "../../../types/news.js";
import { fetchFinnhubGeneralNews } from "./fetchFinnhubGeneralNews.js";
import { finnhubGet } from "./client.js";
import {
  buildFinnhubNewsDateRange,
  mapFinnhubNewsArticle,
  sortNewsByPublishedAt,
} from "./mapFinnhubNewsArticle.js";
import { normalizeSymbol } from "./normalizeSymbol.js";
import { logFinnhubFetchError } from "./optionalFetch.js";
import type { FinnhubNewsArticle } from "./types.js";

/** Fetches company news for one symbol and maps valid rows to incoming articles. */
async function fetchNewsForSymbol(
  symbol: string,
  from: string,
  to: string,
): Promise<IncomingNewsArticle[]> {
  const normalizedSymbol = normalizeSymbol(symbol);

  try {
    const rows = await finnhubGet<FinnhubNewsArticle[]>("/company-news", {
      symbol: normalizedSymbol,
      from,
      to,
    });

    return rows
      .map((row) => mapFinnhubNewsArticle(row, normalizedSymbol))
      .filter((article): article is IncomingNewsArticle => article !== null);
  } catch (error) {
    logFinnhubFetchError(error, normalizedSymbol, "company-news");
    return [];
  }
}

/** Deduplicates articles by URL, keeping the first (newest) occurrence. */
function dedupeArticlesByUrl(articles: IncomingNewsArticle[]): IncomingNewsArticle[] {
  const seenUrls = new Set<string>();

  return articles.filter((article) => {
    if (seenUrls.has(article.url)) {
      return false;
    }

    seenUrls.add(article.url);
    return true;
  });
}

/** Fetches company news for each symbol and returns merged, sorted articles. */
export async function fetchFinnhubNews(symbols: readonly string[]): Promise<IncomingNewsArticle[]> {
  const { from, to } = buildFinnhubNewsDateRange();

  const [generalArticles, ...articlesBySymbol] = await Promise.all([
    fetchFinnhubGeneralNews(),
    ...symbols.map((symbol) => fetchNewsForSymbol(symbol, from, to)),
  ]);

  return sortNewsByPublishedAt(
    dedupeArticlesByUrl([...generalArticles, ...articlesBySymbol.flat()]),
  );
}
