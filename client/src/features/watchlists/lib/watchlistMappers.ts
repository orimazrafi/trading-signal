import { buildSignalReasonFromRecommendation, toSignalAction } from '@/lib/signalUtils'
import type {
  ApiWatchlist,
  ApiWatchlistStock,
  Signal,
  Watchlist,
} from '@/types/watchlist'

/** Maps a server watchlist stock row to a client Signal. */
export function mapApiStockToSignal(stock: ApiWatchlistStock): Signal {
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
export function mapApiWatchlist(watchlist: ApiWatchlist, userId = ''): Watchlist {
  return {
    id: watchlist.id,
    name: watchlist.name,
    userId,
    signals: watchlist.stocks.map(mapApiStockToSignal),
    createdAt: watchlist.createdAt,
  }
}

/** Maps a list of server watchlists to client Watchlist models. */
export function mapApiWatchlists(watchlists: ApiWatchlist[], userId = ''): Watchlist[] {
  return watchlists.map((watchlist) => mapApiWatchlist(watchlist, userId))
}
