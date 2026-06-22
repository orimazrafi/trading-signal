/** Options for the useWatchlists hook. */
export type UseWatchlistsOptions = {
  userId?: string
  enabled?: boolean
}

/** Options for saving a symbol into a watchlist with UI feedback. */
export type UseWatchlistSaveFeedbackOptions = {
  watchlistId: string | null
  watchlistName?: string
  onSave: (symbol: string) => Promise<void>
}
