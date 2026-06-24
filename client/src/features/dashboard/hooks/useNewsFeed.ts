import { useQuery } from '@tanstack/react-query'
import { fetchMarketNews } from '@/api/dashboard'
import { queryKeys } from '@/api/queryKeys'

/** Loads market news via React Query and exposes loading and error state. */
export function useNewsFeed() {
  const newsQuery = useQuery({
    queryKey: queryKeys.dashboard.news,
    queryFn: fetchMarketNews,
    staleTime: 30_000,
    refetchOnMount: true,
  })

  const queryError = newsQuery.error instanceof Error ? newsQuery.error.message : null

  return {
    news: newsQuery.data ?? [],
    isLoading: newsQuery.isLoading,
    error: queryError,
    reload: () => newsQuery.refetch(),
  }
}
