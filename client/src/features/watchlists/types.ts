import type { Watchlist } from '@/types/watchlist'

/** Options for the useWatchlists hook. */
export type UseWatchlistsOptions = {
  userId?: string
  enabled?: boolean
}

/** Options for useWatchlistInitialSelection route sync. */
export type UseWatchlistInitialSelectionOptions = {
  activeWatchlist: Watchlist | null
  activeWatchlistId: string | null
  selectedSymbol: string | null
  watchlistsLoading: boolean
}

/** Options for saving a symbol into a watchlist with UI feedback. */
export type UseWatchlistSaveFeedbackOptions = {
  watchlistId: string | null
  watchlistName?: string
  onSave: (symbol: string) => Promise<void>
}
