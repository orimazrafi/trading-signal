import { api } from './client'
import type { MarketNewsArticle } from '../types/news'

type MarketNewsResponse = {
  news: MarketNewsArticle[]
}

/** Fetches the compiled market news feed from the dashboard API. */
export async function fetchMarketNews(): Promise<MarketNewsArticle[]> {
  const { data } = await api.get<MarketNewsResponse>('/dashboard/news')
  return data.news ?? []
}
