import { z } from "zod";
import { safeParseApiResponse } from "./lib/zodApi.js";

export const newsSentimentSchema = z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]);

export const marketNewsArticleSchema = z.object({
  headline: z.string(),
  url: z.string(),
  source: z.string(),
  publishedAt: z.string(),
  sentiment: newsSentimentSchema,
  symbol: z.string(),
});

export const marketNewsResponseSchema = z.object({
  news: z.array(marketNewsArticleSchema),
  hasMore: z.boolean(),
  nextOffset: z.number().int().nonnegative(),
});

/** Sentiment label assigned to a market news headline. */
export type NewsSentiment = z.infer<typeof newsSentimentSchema>;

/** Processed market news article returned by GET /api/dashboard/news. */
export type MarketNewsArticle = z.infer<typeof marketNewsArticleSchema>;

/** Response body for GET /api/dashboard/news. */
export type MarketNewsResponse = z.infer<typeof marketNewsResponseSchema>;

/** Validates a parsed JSON value as a market news response. */
export function parseMarketNewsResponse(value: unknown): MarketNewsResponse | null {
  return safeParseApiResponse(marketNewsResponseSchema, value);
}
