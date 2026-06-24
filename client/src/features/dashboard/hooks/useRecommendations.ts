import { useQuery } from '@tanstack/react-query'
import { fetchRecommendations } from '@/api/dashboard'
import { queryKeys } from '@/api/queryKeys'

/** Loads dashboard stock recommendations via React Query. */
export function useRecommendations() {
  const recommendationsQuery = useQuery({
    queryKey: queryKeys.dashboard.recommendations,
    queryFn: fetchRecommendations,
  })

  const queryError =
    recommendationsQuery.error instanceof Error ? recommendationsQuery.error.message : null

  return {
    recommendations: recommendationsQuery.data ?? [],
    isLoading: recommendationsQuery.isLoading,
    error: queryError,
    reload: () => recommendationsQuery.refetch(),
  }
}
