import type { StockRecommendation } from '@/types/recommendation'

export type RecommendationsFeedProps = {
  recommendations: StockRecommendation[]
  isLoading: boolean
  error: string | null
  emptyMessage?: string | null
  onAddToWatchlist?: (symbol: string) => Promise<void>
  savingSymbol?: string | null
  watchlistName?: string | null
  onRetry?: () => void
}
