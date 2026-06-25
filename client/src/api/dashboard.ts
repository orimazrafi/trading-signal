import { api } from './client'
import type { ApiRequestOptions } from './types'
import type { MarketNewsArticle, MarketNewsResponse } from '@/types/news'
import type { RecommendationsResponse } from '@/types/recommendation'

/** Fetches the compiled market news feed from the dashboard API. */
export async function fetchMarketNews(options: ApiRequestOptions = {}): Promise<MarketNewsArticle[]> {
  const { data } = await api.get<MarketNewsResponse>('/dashboard/news', { signal: options.signal })
  return data.news ?? []
}

/** Fetches pre-computed stock recommendations from the dashboard API. */
export async function fetchRecommendations(
  options: ApiRequestOptions = {},
): Promise<RecommendationsResponse> {
  const { data } = await api.get<RecommendationsResponse>('/dashboard/recommendations', {
    signal: options.signal,
  })
  return {
    recommendations: data.recommendations ?? [],
    emptyMessage: data.emptyMessage,
  }
}
