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

/** Trading action surfaced in the recommendations feed. */
export type RecommendationAction =
  (typeof RECOMMENDATION_ACTIONS)[keyof typeof RECOMMENDATION_ACTIONS];

/** Signal source that contributed to a stock recommendation. */
export type RecommendationSource =
  (typeof RECOMMENDATION_SOURCES)[keyof typeof RECOMMENDATION_SOURCES];

const recommendationActionValues = new Set<string>(Object.values(RECOMMENDATION_ACTIONS));
const recommendationSourceValues = new Set<string>(Object.values(RECOMMENDATION_SOURCES));

/** Returns true when value is a known recommendation action. */
export function isRecommendationAction(value: string): value is RecommendationAction {
  return recommendationActionValues.has(value);
}

/** Returns true when value is a known recommendation source. */
export function isRecommendationSource(value: string): value is RecommendationSource {
  return recommendationSourceValues.has(value);
}

/** Single factor explaining part of a recommendation score. */
export type RecommendationFactor = {
  source: RecommendationSource;
  label: string;
  value: string;
  weight?: number;
};

/** Processed stock recommendation stored in Redis for the dashboard feed. */
export type StockRecommendation = {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  action: RecommendationAction;
  price: number;
  confidence: number;
  primarySource: RecommendationSource;
  summary: string;
  factors: RecommendationFactor[];
  generatedAt: string;
};
