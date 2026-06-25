import {
  addStockResponseSchema,
  watchlistResponseSchema,
  watchlistsResponseSchema,
} from '@trading-signal/contracts/watchlist'
import type { ApiWatchlist, ApiWatchlistStock } from '@/types/watchlist'
import type { ApiRequestOptions } from './types'
import { api } from './client'
import { fetchValidated, postValidated } from './fetchValidated'

/** Fetches all custom views for the authenticated user. */
export async function fetchWatchlists(options: ApiRequestOptions = {}): Promise<ApiWatchlist[]> {
  const data = await fetchValidated(
    '/watchlists',
    watchlistsResponseSchema,
    'watchlists',
    { signal: options.signal },
  )

  return data.watchlists
}

/** Creates a new named custom view for the authenticated user. */
export async function createWatchlist(name: string): Promise<ApiWatchlist> {
  const data = await postValidated('/watchlists', watchlistResponseSchema, 'watchlist', { name })
  return data.watchlist
}

/** Saves a stock signal into a specific custom view. */
export async function addStockToWatchlist(
  watchlistId: string,
  symbol: string,
): Promise<ApiWatchlistStock> {
  const data = await postValidated(
    `/watchlists/${watchlistId}/stocks`,
    addStockResponseSchema,
    'watchlist stock',
    { symbol },
  )

  return data.stock
}

/** Removes a saved stock signal from a specific custom view. */
export async function removeStockFromWatchlist(
  watchlistId: string,
  signalId: string,
): Promise<void> {
  await api.delete(`/watchlists/${watchlistId}/stocks/${signalId}`)
}
