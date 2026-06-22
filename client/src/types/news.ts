/** Sentiment label assigned to a market news headline. */
export type NewsSentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'

/** Processed market news article returned by GET /api/dashboard/news. */
export type MarketNewsArticle = {
  headline: string
  url: string
  source: string
  publishedAt: string
  sentiment: NewsSentiment
}

/** Response body for GET /api/dashboard/news. */
export type MarketNewsResponse = {
  news: MarketNewsArticle[]
}
