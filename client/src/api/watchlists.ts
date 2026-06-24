import { api } from './client'
import type {
  AddStockResponse,
  ApiWatchlist,
  ApiWatchlistStock,
  RemoveStockResponse,
  WatchlistResponse,
  WatchlistsResponse,
} from '@/types/watchlist'

/** Fetches all custom views for the authenticated user. */
export async function fetchWatchlists(): Promise<ApiWatchlist[]> {
  const { data } = await api.get<WatchlistsResponse>('/watchlists')
  return data.watchlists
}

/** Creates a new named custom view for the authenticated user. */
export async function createWatchlist(name: string): Promise<ApiWatchlist> {
  const { data } = await api.post<WatchlistResponse>('/watchlists', { name })
  return data.watchlist
}

/** Saves a stock signal into a specific custom view. */
export async function addStockToWatchlist(
  watchlistId: string,
  symbol: string,
): Promise<ApiWatchlistStock> {
  const { data } = await api.post<AddStockResponse>(`/watchlists/${watchlistId}/stocks`, {
    symbol,
  })

  return data.stock
}

/** Removes a saved stock signal from a specific custom view. */
export async function removeStockFromWatchlist(
  watchlistId: string,
  signalId: string,
): Promise<void> {
  await api.delete<RemoveStockResponse>(`/watchlists/${watchlistId}/stocks/${signalId}`)
}
