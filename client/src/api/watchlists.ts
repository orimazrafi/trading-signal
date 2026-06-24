import { api } from './client'
import { buildSignalReasonFromRecommendation, toSignalAction } from '@/lib/signalUtils'
import type {
  AddStockResponse,
  ApiWatchlist,
  ApiWatchlistStock,
  RemoveStockResponse,
  Signal,
  Watchlist,
  WatchlistResponse,
  WatchlistsResponse,
} from '@/types/watchlist'

/** Maps a server watchlist stock row to a client Signal. */
function mapApiStockToSignal(stock: ApiWatchlistStock): Signal {
  const action = toSignalAction(stock.recommendation)

  return {
    id: stock.signalId,
    symbol: stock.symbol,
    price: stock.price,
    previousPrice: stock.previousPrice,
    changePercent: stock.changePercent,
    recommendation: stock.recommendation,
    action,
    reason: buildSignalReasonFromRecommendation(stock.recommendation, stock.changePercent),
    createdAt: stock.createdAt,
  }
}

/** Maps a server watchlist payload to the client Watchlist shape. */
function mapApiWatchlist(watchlist: ApiWatchlist, userId = ''): Watchlist {
  return {
    id: watchlist.id,
    name: watchlist.name,
    userId,
    signals: watchlist.stocks.map(mapApiStockToSignal),
    createdAt: watchlist.createdAt,
  }
}

/** Fetches all custom views for the authenticated user. */
export async function fetchWatchlists(userId = ''): Promise<Watchlist[]> {
  const { data } = await api.get<WatchlistsResponse>('/watchlists')
  return data.watchlists.map((watchlist) => mapApiWatchlist(watchlist, userId))
}

/** Creates a new named custom view for the authenticated user. */
export async function createWatchlist(name: string, userId = ''): Promise<Watchlist> {
  const { data } = await api.post<WatchlistResponse>('/watchlists', { name })
  return mapApiWatchlist(data.watchlist, userId)
}

/** Saves a stock signal into a specific custom view. */
export async function addStockToWatchlist(
  watchlistId: string,
  symbol: string,
): Promise<Signal> {
  const { data } = await api.post<AddStockResponse>(`/watchlists/${watchlistId}/stocks`, {
    symbol,
  })

  return mapApiStockToSignal(data.stock)
}

/** Removes a saved stock signal from a specific custom view. */
export async function removeStockFromWatchlist(
  watchlistId: string,
  signalId: string,
): Promise<void> {
  await api.delete<RemoveStockResponse>(`/watchlists/${watchlistId}/stocks/${signalId}`)
}
