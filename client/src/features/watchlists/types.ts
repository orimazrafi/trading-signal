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

/** Options for the useWatchlists hook. */
export type UseWatchlistsOptions = {
  userId?: string
  enabled?: boolean
}
