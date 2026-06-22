import { api } from '../../api/client'
import type { Signal, Watchlist } from '../../types/watchlist'
import { buildSignalReason, toSignalAction } from '../../lib/signalUtils'
import type {
  AddStockResponse,
  ApiWatchlist,
  ApiWatchlistStock,
  WatchlistResponse,
  WatchlistsResponse,
} from './types'

/** Maps a server watchlist stock row to a client Signal. */
function mapApiStockToSignal(stock: ApiWatchlistStock): Signal {
  const action = toSignalAction(stock.recommendation)

  return {
    id: stock.signalId,
    symbol: stock.symbol,
    price: stock.price,
    action,
    reason: buildSignalReason(action),
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
export async function createNewWatchlist(name: string, userId = ''): Promise<Watchlist> {
  const { data } = await api.post<WatchlistResponse>('/watchlists', { name })
  return mapApiWatchlist(data.watchlist, userId)
}

/** Saves a stock signal into a specific custom view. */
export async function addStockToView(
  watchlistId: string,
  symbol: string,
): Promise<Signal> {
  const { data } = await api.post<AddStockResponse>(`/watchlists/${watchlistId}/stocks`, {
    symbol,
  })

  return mapApiStockToSignal(data.stock)
}
