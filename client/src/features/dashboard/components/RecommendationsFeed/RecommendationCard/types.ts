import type { StockRecommendation } from '@/types/recommendation'
import type { StockQuote } from '@/types/stock'

export type RecommendationCardProps = {
  recommendation: StockRecommendation
  onAddToWatchlist?: (symbol: string) => Promise<void>
  saving?: boolean
  watchlistName?: string | null
  liveQuote?: StockQuote | null
  liveQuoteLoading?: boolean
  liveQuoteSyncedAtMs?: number | null
}
