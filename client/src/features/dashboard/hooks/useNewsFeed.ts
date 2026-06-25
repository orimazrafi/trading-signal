import { useState } from 'react'
import { useInfiniteQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { MarketNewsResponse } from '@trading-signal/contracts/news'
import { queryErrorHandledMeta } from '@/lib/queryMeta'
import {
  marketDataQueryOptions,
  MARKET_NEWS_GC_TIME_MS,
  MARKET_NEWS_STALE_TIME_MS,
} from '@/lib/marketDataQueryOptions'
import { fetchMarketNews } from '@/api/dashboard'
import { queryKeys } from '@/api/queryKeys'

const NEWS_PAGE_SIZE = 15
const NEWS_FEED_FIRST_PAGE_OFFSET = 0

/** Fetches page one from the API with `refresh=true` so headlines rotate. */
async function fetchRefreshedNewsFirstPage(): Promise<MarketNewsResponse> {
  return fetchMarketNews({
    offset: NEWS_FEED_FIRST_PAGE_OFFSET,
    limit: NEWS_PAGE_SIZE,
    refresh: true,
  })
}

/** Replaces the infinite-query cache with a single fresh first page. */
function resetNewsFeedToFirstPage(queryClient: QueryClient, firstPage: MarketNewsResponse): void {
  queryClient.setQueryData(queryKeys.dashboard.news, {
    pages: [firstPage],
    pageParams: [NEWS_FEED_FIRST_PAGE_OFFSET],
  })
}

/** Loads market news with infinite scroll and manual refresh support. */
export function useNewsFeed() {
  const queryClient = useQueryClient()
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)

  const newsQuery = useInfiniteQuery({
    queryKey: queryKeys.dashboard.news,
    queryFn: ({ pageParam, signal }) =>
      fetchMarketNews({ offset: pageParam, limit: NEWS_PAGE_SIZE, signal }),
    initialPageParam: NEWS_FEED_FIRST_PAGE_OFFSET,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    staleTime: MARKET_NEWS_STALE_TIME_MS,
    gcTime: MARKET_NEWS_GC_TIME_MS,
    ...marketDataQueryOptions,
    meta: queryErrorHandledMeta,
  })

  const news = newsQuery.data?.pages.flatMap((page) => page.news) ?? []
  const queryError = newsQuery.error instanceof Error ? newsQuery.error.message : null
  const hasMore = newsQuery.hasNextPage ?? false
  const isLoadingMore = newsQuery.isFetchingNextPage
  const isRefreshing =
    isManualRefreshing ||
    (newsQuery.isFetching && !newsQuery.isLoading && !newsQuery.isFetchingNextPage)

  /** Fetches a fresh batch from the provider and resets the feed to page one. */
  const reload = async () => {
    setIsManualRefreshing(true)

    try {
      const firstPage = await fetchRefreshedNewsFirstPage()
      resetNewsFeedToFirstPage(queryClient, firstPage)
    } finally {
      setIsManualRefreshing(false)
    }
  }

  /** Loads the next page when the scroll sentinel becomes visible. */
  const loadMore = () => {
    if (!hasMore || isLoadingMore || newsQuery.isLoading) {
      return
    }

    void newsQuery.fetchNextPage()
  }

  return {
    news,
    isLoading: newsQuery.isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error: queryError,
    reload,
    loadMore,
  }
}
