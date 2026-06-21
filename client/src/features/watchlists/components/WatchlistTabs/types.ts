import type { Watchlist } from '../../../../types/watchlist'

/** Props for the watchlist tab bar and create-view dialog. */
export type WatchlistTabsProps = {
  watchlists: Watchlist[]
  activeWatchlistId: string | null
  onSelectWatchlist: (watchlistId: string) => void
  onCreateWatchlist: (name: string) => Promise<void>
  creating?: boolean
}
