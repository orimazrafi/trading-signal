/** Live or cached stock quote from GET /api/stock/:symbol. */
export type StockQuote = {
  symbol: string
  name: string
  price: number
  peRatio: number
  sector: string
}

/** Response from GET /api/stocks/:symbol/search. */
export type SearchStockResult = {
  quote: StockQuote
  recommendation: string
  signalId: string
}

/** Supported lookback window for GET /api/stock/:symbol/history. */
export type StockHistoryRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y'

/** One OHLCV bar returned by the stock history API. */
export type StockHistoryPoint = {
  time: string | number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/** Response from GET /api/stock/:symbol/history. */
export type StockHistory = {
  symbol: string
  interval: string
  range: StockHistoryRange
  points: StockHistoryPoint[]
}
