import { z } from "zod";
import { safeParseApiResponse } from "./lib/zodApi.js";

/** Allowed trading actions surfaced in the recommendations feed. */
export const RECOMMENDATION_ACTIONS = {
  BUY: "BUY",
  SELL: "SELL",
  HOLD: "HOLD",
  STRONG_BUY: "STRONG_BUY",
} as const;

/** Allowed signal sources for a recommendation score. */
export const RECOMMENDATION_SOURCES = {
  fundamental: "fundamental",
  sector: "sector",
  technical: "technical",
  analyst: "analyst",
} as const;

export const recommendationActionSchema = z.enum([
  RECOMMENDATION_ACTIONS.BUY,
  RECOMMENDATION_ACTIONS.SELL,
  RECOMMENDATION_ACTIONS.HOLD,
  RECOMMENDATION_ACTIONS.STRONG_BUY,
]);

export const recommendationSourceSchema = z.enum([
  RECOMMENDATION_SOURCES.fundamental,
  RECOMMENDATION_SOURCES.sector,
  RECOMMENDATION_SOURCES.technical,
  RECOMMENDATION_SOURCES.analyst,
]);

/** Trading action surfaced in the recommendations feed. */
export type RecommendationAction = z.infer<typeof recommendationActionSchema>;

/** Signal source that contributed to a stock recommendation. */
export type RecommendationSource = z.infer<typeof recommendationSourceSchema>;

/** Returns true when value is a known recommendation action. */
export function isRecommendationAction(value: string): value is RecommendationAction {
  return recommendationActionSchema.safeParse(value).success;
}

/** Returns true when value is a known recommendation source. */
export function isRecommendationSource(value: string): value is RecommendationSource {
  return recommendationSourceSchema.safeParse(value).success;
}

export const recommendationFactorSchema = z.object({
  source: recommendationSourceSchema,
  label: z.string(),
  value: z.string(),
  weight: z.number().finite().optional(),
});

export const stockRecommendationSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  sector: z.string(),
  action: recommendationActionSchema,
  price: z.number().finite(),
  confidence: z.number().finite(),
  primarySource: recommendationSourceSchema,
  summary: z.string(),
  factors: z.array(recommendationFactorSchema),
  generatedAt: z.string(),
});

export const recommendationsResponseSchema = z.object({
  recommendations: z.array(stockRecommendationSchema),
  emptyMessage: z.string().optional(),
});

/** Single factor explaining part of a recommendation score. */
export type RecommendationFactor = z.infer<typeof recommendationFactorSchema>;

/** Processed stock recommendation returned by GET /api/dashboard/recommendations. */
export type StockRecommendation = z.infer<typeof stockRecommendationSchema>;

/** Response body for GET /api/dashboard/recommendations. */
export type RecommendationsResponse = z.infer<typeof recommendationsResponseSchema>;

/** Validates a parsed JSON value as a recommendations list response. */
export function parseRecommendationsResponse(value: unknown): RecommendationsResponse | null {
  return safeParseApiResponse(recommendationsResponseSchema, value);
}
