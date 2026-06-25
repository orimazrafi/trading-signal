import { useNewsFeed } from '@/features/dashboard/hooks/useNewsFeed'
import { NewsFeed } from '@/features/dashboard/components/NewsFeed'
import { useQuickAddToWatchlist } from '@/features/watchlists/hooks/useQuickAddToWatchlist'
import type { NewsTabProps } from './types'

/** Default home tab with the full-width watchlist news feed. */
function NewsTab({ userId }: NewsTabProps) {
  const { news, isLoading, error } = useNewsFeed()
  const { quickAdd, savingSymbol, watchlistName, watchlistSymbols } = useQuickAddToWatchlist(userId)

  return (
    <NewsFeed
      news={news}
      isLoading={isLoading}
      error={error}
      variant="watchlist"
      watchlistSymbols={watchlistSymbols}
      onAddToWatchlist={quickAdd}
      savingSymbol={savingSymbol}
      watchlistName={watchlistName}
    />
  )
}

export default NewsTab
