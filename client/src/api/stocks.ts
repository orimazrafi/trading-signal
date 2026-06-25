import { api } from './client'
import type { ApiRequestOptions } from './types'
import type { SearchStockResult, StockHistory, StockHistoryRange, StockQuote } from '@/types/stock'

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase()
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

  const { data } = await api.get<StockQuote>(`/stock/${encodeURIComponent(normalized)}`, {
    signal: options.signal,
  })
  return data
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

  const { data } = await api.get<StockHistory>(
    `/stock/${encodeURIComponent(normalized)}/history`,
    { params: { range }, signal: options.signal },
  )

  return data
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

  const { data } = await api.get<SearchStockResult>(
    `/stocks/${encodeURIComponent(normalized)}/search`,
    { signal: options.signal },
  )

  return data
}
