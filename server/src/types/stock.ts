import { parseStockQuote as parseStockQuoteFromContracts } from "@trading-signal/contracts/stock.js";

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  peRatio: number;
  sector: string;
}

export interface SearchStockResult {
  quote: StockQuote;
  recommendation: string;
  signalId: string;
}

export type NewsSentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export interface NewsItem {
  headline: string;
  source: string;
  publishedAt: string;
  sentiment: NewsSentiment;
}

/** Validates cached stock quote JSON from Redis. */
export function parseStockQuote(value: unknown): StockQuote | null {
  return parseStockQuoteFromContracts(value);
}
