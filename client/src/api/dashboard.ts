import { marketNewsResponseSchema } from '@trading-signal/contracts/news'
import { recommendationsResponseSchema } from '@trading-signal/contracts/recommendation'
import type { MarketNewsArticle } from '@/types/news'
import type { RecommendationsResponse } from '@/types/recommendation'
import type { ApiRequestOptions } from './types'
import { fetchValidated } from './fetchValidated'

/** Fetches the compiled market news feed from the dashboard API. */
export async function fetchMarketNews(options: ApiRequestOptions = {}): Promise<MarketNewsArticle[]> {
  const data = await fetchValidated(
    '/dashboard/news',
    marketNewsResponseSchema,
    'market news',
    { signal: options.signal },
  )

  return data.news
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
