import type { StockRecommendation } from '@/types/recommendation'

export type RecommendationsFeedProps = {
  recommendations: StockRecommendation[]
  isLoading: boolean
  error: string | null
  emptyMessage?: string | null
  onAddToWatchlist?: (symbol: string) => Promise<void>
  onRemoveFromWatchlist?: (symbol: string) => Promise<void>
  isSymbolInActiveWatchlist?: (symbol: string) => boolean
  savingSymbol?: string | null
  watchlistName?: string | null
  onRetry?: () => void
}
