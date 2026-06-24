/** Props for the quick-add-to-watchlist action button. */
export type AddToWatchlistButtonProps = {
  symbol: string
  onAdd: (symbol: string) => Promise<void>
  saving?: boolean
  disabled?: boolean
  watchlistName?: string | null
}
