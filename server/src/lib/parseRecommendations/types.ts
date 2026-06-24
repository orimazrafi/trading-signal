import type { RecommendationAction, RecommendationSource } from "../../types/recommendation.js";

/** Validated recommendation fields before factor parsing. */
export type StockRecommendationFields = {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  action: RecommendationAction;
  price: number;
  confidence: number;
  primarySource: RecommendationSource;
  summary: string;
  factors: unknown[];
  generatedAt: string;
};

/** Validated factor fields before optional weight is applied. */
export type RecommendationFactorFields = {
  source: RecommendationSource;
  label: string;
  value: string;
};
