import type { MarketDataProvider } from "../types.js";
import { fetchFinnhubHistory } from "./fetchFinnhubHistory.js";
import { fetchFinnhubNews } from "./fetchFinnhubNews.js";
import { fetchFinnhubQuote } from "./fetchFinnhubQuote.js";

/** Finnhub market data provider implementation. */
export function createFinnhubProvider(): MarketDataProvider {
  return {
    id: "finnhub",
    fetchQuote: fetchFinnhubQuote,
    fetchHistory: fetchFinnhubHistory,
    fetchNewsArticles: fetchFinnhubNews,
  };
}
