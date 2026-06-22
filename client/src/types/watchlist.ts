/** Allowed trading actions for a saved watchlist signal. */
export const SIGNAL_ACTIONS = {
  BUY: 'BUY',
  SELL: 'SELL',
  HOLD: 'HOLD',
} as const

/** Trading recommendation action for a saved signal. */
export type SignalAction = (typeof SIGNAL_ACTIONS)[keyof typeof SIGNAL_ACTIONS]

/** Persisted stock signal shown in a custom dashboard view. */
export interface Signal {
  id: string
  symbol: string
  price: number
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

/** Raw watchlist stock row from the watchlists API. */
export type ApiWatchlistStock = {
  signalId: string
  symbol: string
  recommendation: string
  price: number
  previousPrice: number
  changePercent: number
  createdAt: string
}

/** Raw watchlist payload from the watchlists API. */
export type ApiWatchlist = {
  id: string
  name: string
  createdAt: string
  stocks: ApiWatchlistStock[]
}

/** Response body for GET /api/watchlists. */
export type WatchlistsResponse = {
  watchlists: ApiWatchlist[]
}

/** Response body for POST /api/watchlists. */
export type WatchlistResponse = {
  watchlist: ApiWatchlist
}

/** Response body for POST /api/watchlists/:id/stocks. */
export type AddStockResponse = {
  stock: ApiWatchlistStock
}

/** Response body for DELETE /api/watchlists/:id/stocks/:signalId. */
export type RemoveStockResponse = {
  ok: boolean
}
