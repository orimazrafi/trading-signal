import { RecommendationsFeed } from '@/features/dashboard/components/RecommendationsFeed'
import { useRecommendations } from '@/features/dashboard/hooks/useRecommendations'
import type { RecommendationsTabProps } from './types'

/** Market ideas tab backed by the dashboard recommendations API. */
function RecommendationsTab({
  onAddToWatchlist,
  savingSymbol,
  watchlistName,
}: RecommendationsTabProps) {
  const { recommendations, isLoading, error, emptyMessage } = useRecommendations()

  return (
    <RecommendationsFeed
      recommendations={recommendations}
      isLoading={isLoading}
      error={error}
      emptyMessage={emptyMessage}
      onAddToWatchlist={onAddToWatchlist}
      savingSymbol={savingSymbol}
      watchlistName={watchlistName}
    />
  )
}

export default RecommendationsTab
