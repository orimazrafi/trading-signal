import type { NewsFeedProps } from '@/features/dashboard/components/NewsFeed/types'

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
