import type { StockRecommendation } from '@/types/recommendation'
import { AsyncListPanel } from '@/components/AsyncListPanel'
import RecommendationCard from './RecommendationCard'

export type RecommendationsFeedProps = {
  recommendations: StockRecommendation[]
  isLoading: boolean
  error: string | null
  emptyMessage?: string | null
  onAddToWatchlist?: (symbol: string) => Promise<void>
  savingSymbol?: string | null
  watchlistName?: string | null
}

const DEFAULT_EMPTY_MESSAGE =
  'No market ideas are available right now. Please check back in a few minutes.'

/** Renders the dashboard market ideas list with transparent factor breakdowns. */
function RecommendationsFeed({
  recommendations,
  isLoading,
  error,
  emptyMessage,
  onAddToWatchlist,
  savingSymbol,
  watchlistName,
}: RecommendationsFeedProps) {
  return (
    <AsyncListPanel
      title="Market Ideas"
      description="Research prompts scored by valuation and sector context — not financial advice"
      items={recommendations}
      isLoading={isLoading}
      error={error}
      emptyMessage={emptyMessage ?? DEFAULT_EMPTY_MESSAGE}
      loadingLabel="Loading market ideas…"
      variant="page"
      getItemKey={(recommendation) => recommendation.id}
      renderItem={(recommendation) => (
        <RecommendationCard
          recommendation={recommendation}
          onAddToWatchlist={onAddToWatchlist}
          saving={savingSymbol === recommendation.symbol}
          watchlistName={watchlistName}
        />
      )}
    />
  )
}

export default RecommendationsFeed
