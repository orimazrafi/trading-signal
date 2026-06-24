import type { StockRecommendation } from '@/types/recommendation'

export type RecommendationCardProps = {
  recommendation: StockRecommendation
  onAddToWatchlist?: (symbol: string) => Promise<void>
  saving?: boolean
  watchlistName?: string | null
}
