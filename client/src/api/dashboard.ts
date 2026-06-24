import { api } from './client'
import type { MarketNewsArticle, MarketNewsResponse } from '@/types/news'
import type { RecommendationsResponse, StockRecommendation } from '@/types/recommendation'

/** Fetches the compiled market news feed from the dashboard API. */
export async function fetchMarketNews(): Promise<MarketNewsArticle[]> {
  const { data } = await api.get<MarketNewsResponse>('/dashboard/news')
  return data.news ?? []
}

/** Fetches pre-computed stock recommendations from the dashboard API. */
export async function fetchRecommendations(): Promise<StockRecommendation[]> {
  const { data } = await api.get<RecommendationsResponse>('/dashboard/recommendations')
  return data.recommendations ?? []
}
