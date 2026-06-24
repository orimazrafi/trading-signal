import type { MarketNewsArticle } from '@/types/news'

/** Props for the scrollable market news feed panel. */
export type NewsFeedProps = {
  news: MarketNewsArticle[]
  isLoading: boolean
  error: string | null
  variant?: 'panel' | 'page'
}
