import type { NewsFeedProps } from '@/features/dashboard/components/NewsFeed/types'
import { NewsFeed } from '@/features/dashboard/components/NewsFeed'

export type NewsTabProps = Pick<
  NewsFeedProps,
  | 'news'
  | 'isLoading'
  | 'error'
  | 'watchlistSymbols'
  | 'onAddToWatchlist'
  | 'savingSymbol'
  | 'watchlistName'
>

/** Default home tab with the full-width watchlist news feed. */
function NewsTab(props: NewsTabProps) {
  return <NewsFeed {...props} variant="page" />
}

export default NewsTab
