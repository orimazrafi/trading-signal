import {
  searchStockResultSchema,
  stockHistorySchema,
  stockQuoteSchema,
  stockQuotesBatchResponseSchema,
} from '@trading-signal/contracts/stock'
import type { SearchStockResult, StockHistory, StockHistoryRange, StockQuote } from '@/types/stock'
import type { ApiRequestOptions } from './types'
import { fetchValidated, postValidated } from './fetchValidated'

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase()
}

/** Fetches live or cached quotes for multiple symbols in one request. */
export async function fetchStockQuotes(
  symbols: readonly string[],
  options: ApiRequestOptions = {},
): Promise<StockQuote[]> {
  const normalized = [
    ...new Set(
      symbols
        .map((symbol) => symbol.trim().toUpperCase())
        .filter((symbol) => symbol.length > 0),
    ),
  ]

  if (normalized.length === 0) {
    return []
  }

  const response = await postValidated(
    '/stocks/quotes',
    stockQuotesBatchResponseSchema,
    'stock quotes batch',
    { symbols: normalized },
    { signal: options.signal },
  )

  return response.quotes
}

/** Fetches a live or cached stock quote without persisting a signal. */
export async function fetchStockQuote(
  symbol: string,
  options: ApiRequestOptions = {},
): Promise<StockQuote> {
  const normalized = normalizeSymbol(symbol)

  if (!normalized) {
    throw new Error('Stock symbol is required')
  }

  return fetchValidated(
    `/stock/${encodeURIComponent(normalized)}`,
    stockQuoteSchema,
    'stock quote',
    { signal: options.signal },
  )
}

/** Fetches cached or live daily OHLCV history for charting. */
export async function fetchStockHistory(
  symbol: string,
  range: StockHistoryRange,
  options: ApiRequestOptions = {},
): Promise<StockHistory> {
  const normalized = normalizeSymbol(symbol)

  if (!normalized) {
    throw new Error('Stock symbol is required')
  }

  return fetchValidated(
    `/stock/${encodeURIComponent(normalized)}/history`,
    stockHistorySchema,
    'stock history',
    { params: { range }, signal: options.signal },
  )
}

/** Searches a stock, generates a recommendation, and persists a user signal. */
export async function searchStock(
  symbol: string,
  options: ApiRequestOptions = {},
): Promise<SearchStockResult> {
  const normalized = normalizeSymbol(symbol)

  if (!normalized) {
    throw new Error('Stock symbol is required')
  }

  return fetchValidated(
    `/stocks/${encodeURIComponent(normalized)}/search`,
    searchStockResultSchema,
    'stock search result',
    { signal: options.signal },
  )
}
