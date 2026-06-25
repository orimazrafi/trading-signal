import { SIGNAL_ACTIONS, type SignalAction } from '@trading-signal/contracts/signal'

export { SIGNAL_ACTIONS, type SignalAction }

export type {
  AddStockResponse,
  ApiWatchlist,
  ApiWatchlistStock,
  RemoveStockResponse,
  WatchlistResponse,
  WatchlistsResponse,
} from '@trading-signal/contracts/watchlist'

/** Persisted stock signal shown in a custom dashboard view. */
export interface Signal {
  id: string
  symbol: string
  price: number
  previousPrice: number
  changePercent: number
  recommendation: string
  action: SignalAction
  reason: string
  createdAt: string
}

/** User-owned custom dashboard view containing saved signals. */
export interface Watchlist {
  id: string
  name: string
  userId: string
  signals: Signal[]
  createdAt: string
}
