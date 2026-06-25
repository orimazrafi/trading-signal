/** Props for the quick-add-to-watchlist action button. */
export type AddToWatchlistButtonProps = {
  symbol: string
  onAdd: (symbol: string) => Promise<void>
  onRemove?: (symbol: string) => Promise<void>
  isInWatchlist?: boolean
  saving?: boolean
  removing?: boolean
  watchlistName?: string | null
}
