import type { ProcessedNewsArticle } from "../types/news.js";

const DEFAULT_MAX_PER_SYMBOL = 3;

/** Limits how many headlines appear per symbol so the feed stays diverse. */
export function diversifyNewsArticles(
  articles: ProcessedNewsArticle[],
  maxArticles: number,
  maxPerSymbol: number = DEFAULT_MAX_PER_SYMBOL,
): ProcessedNewsArticle[] {
  const symbolCounts = new Map<string, number>();
  const diversified: ProcessedNewsArticle[] = [];

  for (const article of articles) {
    const symbolCount = symbolCounts.get(article.symbol) ?? 0;

    if (symbolCount >= maxPerSymbol) {
      continue;
    }

    diversified.push(article);
    symbolCounts.set(article.symbol, symbolCount + 1);

    if (diversified.length >= maxArticles) {
      break;
    }
  }

  return diversified;
}
