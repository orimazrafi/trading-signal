import type { IncomingNewsArticle } from "../../types/news.js";
import type { StockQuote } from "../../types/stock.js";
import type { StockHistory, StockHistoryRange } from "../../types/stockHistory.js";

/** Supported third-party market data vendors. */
export const MARKET_DATA_PROVIDER_IDS = ["finnhub", "twelveData", "yahoo"] as const;

export type MarketDataProviderId = (typeof MARKET_DATA_PROVIDER_IDS)[number];

/** Vendor-agnostic market data access used by stock and news services. */
export type MarketDataProvider = {
  readonly id: MarketDataProviderId;
  fetchQuote(symbol: string): Promise<StockQuote>;
  fetchHistory(symbol: string, range: StockHistoryRange): Promise<StockHistory>;
  fetchNewsArticles(symbols: readonly string[]): Promise<IncomingNewsArticle[]>;
};
