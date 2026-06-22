import { api } from '../../api/client'
import type { SearchStockResult, StockQuote } from '../../types/stock'

/** Fetches a live or cached stock quote without persisting a signal. */
export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const normalized = symbol.trim().toUpperCase()

  if (!normalized) {
    throw new Error('Stock symbol is required')
  }

  const { data } = await api.get<StockQuote>(`/stock/${encodeURIComponent(normalized)}`)
  return data
}

/** Searches a stock, generates a recommendation, and persists a user signal. */
export async function searchStock(symbol: string): Promise<SearchStockResult> {
  const normalized = symbol.trim().toUpperCase()

  if (!normalized) {
    throw new Error('Stock symbol is required')
  }

  const { data } = await api.get<SearchStockResult>(
    `/stocks/${encodeURIComponent(normalized)}/search`,
  )

  return data
}
