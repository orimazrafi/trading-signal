import { RecommendationsFeed } from '../components/RecommendationsFeed'
import { useRecommendations } from '../hooks/useRecommendations'

/** Recommendations tab backed by the dashboard recommendations API. */
export function RecommendationsTab() {
  const { recommendations, isLoading, error } = useRecommendations()

  return (
    <RecommendationsFeed
      recommendations={recommendations}
      isLoading={isLoading}
      error={error}
    />
  )
}
