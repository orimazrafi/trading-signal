import { useQuery } from '@tanstack/react-query'
import { queryErrorHandledMeta } from '@/lib/queryMeta'
import {
  marketDataQueryOptions,
  MARKET_NEWS_GC_TIME_MS,
  MARKET_NEWS_STALE_TIME_MS,
} from '@/lib/marketDataQueryOptions'
import { fetchMarketNews } from '@/api/dashboard'
import { queryKeys } from '@/api/queryKeys'

/** Loads market news via React Query and exposes loading and error state. */
export function useNewsFeed() {
  const newsQuery = useQuery({
    queryKey: queryKeys.dashboard.news,
    queryFn: ({ signal }) => fetchMarketNews({ signal }),
    staleTime: MARKET_NEWS_STALE_TIME_MS,
    gcTime: MARKET_NEWS_GC_TIME_MS,
    ...marketDataQueryOptions,
    meta: queryErrorHandledMeta,
  })

  const queryError = newsQuery.error instanceof Error ? newsQuery.error.message : null

  return {
    news: newsQuery.data ?? [],
    isLoading: newsQuery.isLoading,
    isRefreshing: newsQuery.isFetching && !newsQuery.isLoading,
    error: queryError,
    reload: () => newsQuery.refetch(),
  }
}
