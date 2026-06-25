import { useQuery } from '@tanstack/react-query'
import { fetchRecommendations } from '@/api/dashboard'
import { queryKeys } from '@/api/queryKeys'
import {
  marketDataQueryOptions,
  RECOMMENDATIONS_GC_TIME_MS,
  RECOMMENDATIONS_STALE_TIME_MS,
} from '@/lib/marketDataQueryOptions'
import { queryErrorHandledMeta } from '@/lib/queryMeta'

/** Loads dashboard stock recommendations via React Query. */
export function useRecommendations() {
  const recommendationsQuery = useQuery({
    queryKey: queryKeys.dashboard.recommendations,
    queryFn: ({ signal }) => fetchRecommendations({ signal }),
    staleTime: RECOMMENDATIONS_STALE_TIME_MS,
    gcTime: RECOMMENDATIONS_GC_TIME_MS,
    ...marketDataQueryOptions,
    meta: queryErrorHandledMeta,
  })

  const queryError =
    recommendationsQuery.error instanceof Error ? recommendationsQuery.error.message : null

  return {
    recommendations: recommendationsQuery.data?.recommendations ?? [],
    emptyMessage: recommendationsQuery.data?.emptyMessage ?? null,
    isLoading: recommendationsQuery.isLoading,
    error: queryError,
    reload: () => recommendationsQuery.refetch(),
  }
}
