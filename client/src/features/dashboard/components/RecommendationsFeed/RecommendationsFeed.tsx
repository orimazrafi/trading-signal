import { AsyncListPanel } from '@/components/AsyncListPanel'
import RecommendationCard from './RecommendationCard'
import type { RecommendationsFeedProps } from './types'

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
  onRetry,
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
      onRetry={onRetry}
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
