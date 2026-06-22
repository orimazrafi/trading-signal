import { api } from './client'
import type { SearchStockResult, StockQuote } from '../types/stock'
import type { StockHistory, StockHistoryRange } from '../types/stockHistory'

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase()
}

/** Fetches a live or cached stock quote without persisting a signal. */
export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const normalized = normalizeSymbol(symbol)

  if (!normalized) {
    throw new Error('Stock symbol is required')
  }

  const { data } = await api.get<StockQuote>(`/stock/${encodeURIComponent(normalized)}`)
  return data
}

/** Fetches cached or live daily OHLCV history for charting. */
export async function fetchStockHistory(
  symbol: string,
  range: StockHistoryRange,
): Promise<StockHistory> {
  const normalized = normalizeSymbol(symbol)

  if (!normalized) {
    throw new Error('Stock symbol is required')
  }

  const { data } = await api.get<StockHistory>(
    `/stock/${encodeURIComponent(normalized)}/history`,
    { params: { range } },
  )

  return data
}

/** Searches a stock, generates a recommendation, and persists a user signal. */
export async function searchStock(symbol: string): Promise<SearchStockResult> {
  const normalized = normalizeSymbol(symbol)

  if (!normalized) {
    throw new Error('Stock symbol is required')
  }

  const { data } = await api.get<SearchStockResult>(
    `/stocks/${encodeURIComponent(normalized)}/search`,
  )

  return data
}
