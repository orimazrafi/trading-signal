/** Supported dashboard chart lookback windows. */
export const STOCK_HISTORY_RANGES = ["1M", "3M", "6M", "1Y"] as const;

export type StockHistoryRange = (typeof STOCK_HISTORY_RANGES)[number];

/** One OHLCV bar returned by the history API. */
export type StockHistoryPoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/** Historical price series for a single symbol and range. */
export type StockHistory = {
  symbol: string;
  interval: string;
  range: StockHistoryRange;
  points: StockHistoryPoint[];
};

/** Returns true when value is a supported history range label. */
export function isStockHistoryRange(value: string): value is StockHistoryRange {
  return (STOCK_HISTORY_RANGES as readonly string[]).includes(value);
}
