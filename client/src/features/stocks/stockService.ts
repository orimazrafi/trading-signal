import { api } from '../../api/client'
import type { SearchStockResult } from '../../types/stock'

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
