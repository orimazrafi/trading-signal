import { RecommendationsFeed } from '@/features/dashboard/components/RecommendationsFeed'
import { useRecommendations } from '@/features/dashboard/hooks/useRecommendations'

/** Recommendations tab backed by the dashboard recommendations API. */
function RecommendationsTab() {
  const { recommendations, isLoading, error } = useRecommendations()

  return (
    <RecommendationsFeed
      recommendations={recommendations}
      isLoading={isLoading}
      error={error}
    />
  )
}

export default RecommendationsTab
