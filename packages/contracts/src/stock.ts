import { z } from "zod";
import { safeParseApiResponse } from "./lib/zodApi.js";

/** Supported lookback window for GET /api/stock/:symbol/history. */
export const STOCK_HISTORY_RANGES = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y"] as const;

export const stockHistoryRangeSchema = z.enum(STOCK_HISTORY_RANGES);

/** Chart lookback window label accepted by the stock history API. */
export type StockHistoryRange = z.infer<typeof stockHistoryRangeSchema>;

const stockHistoryRangeValues = new Set<string>(STOCK_HISTORY_RANGES);

/** Returns true when value is a supported history range label. */
export function isStockHistoryRange(value: string): value is StockHistoryRange {
  return stockHistoryRangeValues.has(value);
}

export const stockQuoteSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number().finite(),
  peRatio: z.number().finite(),
  sector: z.string(),
});

export const stockHistoryPointSchema = z.object({
  time: z.union([z.string(), z.number().finite()]),
  open: z.number().finite(),
  high: z.number().finite(),
  low: z.number().finite(),
  close: z.number().finite(),
  volume: z.number().finite(),
});

export const stockHistorySchema = z.object({
  symbol: z.string(),
  interval: z.string(),
  range: stockHistoryRangeSchema,
  points: z.array(stockHistoryPointSchema),
});

export const searchStockResultSchema = z.object({
  quote: stockQuoteSchema,
  recommendation: z.string(),
  signalId: z.string(),
});

/** Live or cached stock quote from GET /api/stock/:symbol. */
export type StockQuote = z.infer<typeof stockQuoteSchema>;

/** One OHLCV bar returned by the stock history API. */
export type StockHistoryPoint = z.infer<typeof stockHistoryPointSchema>;

/** Response from GET /api/stock/:symbol/history. */
export type StockHistory = z.infer<typeof stockHistorySchema>;

/** Response from GET /api/stocks/:symbol/search. */
export type SearchStockResult = z.infer<typeof searchStockResultSchema>;

/** Validates a parsed JSON value as a stock quote. */
export function parseStockQuote(value: unknown): StockQuote | null {
  return safeParseApiResponse(stockQuoteSchema, value);
}

/** Validates a parsed JSON value as one OHLCV history bar. */
export function parseStockHistoryPoint(value: unknown): StockHistoryPoint | null {
  return safeParseApiResponse(stockHistoryPointSchema, value);
}

/** Validates a parsed JSON value as stock history for charting. */
export function parseStockHistory(value: unknown): StockHistory | null {
  return safeParseApiResponse(stockHistorySchema, value);
}

/** Validates a parsed JSON value as a stock search result. */
export function parseSearchStockResult(value: unknown): SearchStockResult | null {
  return safeParseApiResponse(searchStockResultSchema, value);
}
