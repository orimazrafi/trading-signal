import type { MarketNewsResponse } from '@trading-signal/contracts/news'
import { marketNewsResponseSchema } from '@trading-signal/contracts/news'
import { recommendationsResponseSchema } from '@trading-signal/contracts/recommendation'
import type { RecommendationsResponse } from '@/types/recommendation'
import type { ApiRequestOptions } from './types'
import { fetchValidated } from './fetchValidated'

/** Query parameters for a paginated market news request. */
export type FetchMarketNewsParams = ApiRequestOptions & {
  limit?: number
  offset?: number
  refresh?: boolean
}

/** Builds axios query params for GET /dashboard/news. */
function buildMarketNewsQueryParams({
  limit,
  offset,
  refresh,
}: Pick<FetchMarketNewsParams, 'limit' | 'offset' | 'refresh'>): Record<string, string | number> {
  const query: Record<string, string | number> = {}

  if (limit !== undefined) {
    query.limit = limit
  }

  if (offset !== undefined) {
    query.offset = offset
  }

  if (refresh) {
    query.refresh = 'true'
  }

  return query
}

/** Fetches a paginated market news page from the dashboard API. */
export async function fetchMarketNews(
  params: FetchMarketNewsParams = {},
): Promise<MarketNewsResponse> {
  const { limit, offset, refresh, signal } = params

  return fetchValidated(
    '/dashboard/news',
    marketNewsResponseSchema,
    'market news',
    {
      signal,
      params: buildMarketNewsQueryParams({ limit, offset, refresh }),
    },
  )
}

/** Fetches pre-computed stock recommendations from the dashboard API. */
export async function fetchRecommendations(
  options: ApiRequestOptions = {},
): Promise<RecommendationsResponse> {
  return fetchValidated(
    '/dashboard/recommendations',
    recommendationsResponseSchema,
    'recommendations',
    { signal: options.signal },
  )
}
