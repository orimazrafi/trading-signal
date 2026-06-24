import {
  isRecommendationAction,
  isRecommendationSource,
  type RecommendationFactor,
  type StockRecommendation,
} from "../../types/recommendation.js";
import type { RecommendationFactorFields, StockRecommendationFields } from "./types.js";

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validates required stock recommendation fields from cached Redis JSON. */
function parseStockRecommendationFields(
  item: Record<string, unknown>,
): StockRecommendationFields | null {
  const {
    id,
    symbol,
    name,
    sector,
    action,
    price,
    confidence,
    primarySource,
    summary,
    factors,
    generatedAt,
  } = item;

  if (
    typeof id !== "string" ||
    typeof symbol !== "string" ||
    typeof name !== "string" ||
    typeof sector !== "string" ||
    typeof action !== "string" ||
    !isRecommendationAction(action) ||
    typeof price !== "number" ||
    typeof confidence !== "number" ||
    typeof primarySource !== "string" ||
    !isRecommendationSource(primarySource) ||
    typeof summary !== "string" ||
    !Array.isArray(factors) ||
    typeof generatedAt !== "string"
  ) {
    return null;
  }

  return {
    id,
    symbol,
    name,
    sector,
    action,
    price,
    confidence,
    primarySource,
    summary,
    factors,
    generatedAt,
  };
}

/** Validates required recommendation factor fields from cached Redis JSON. */
function parseRecommendationFactorFields(
  item: Record<string, unknown>,
): RecommendationFactorFields | null {
  const { source, label, value: factorValue } = item;

  if (
    typeof source !== "string" ||
    !isRecommendationSource(source) ||
    typeof label !== "string" ||
    typeof factorValue !== "string"
  ) {
    return null;
  }

  return {
    source,
    label,
    value: factorValue,
  };
}

/** Validates a cached recommendation factor from Redis JSON. */
function parseRecommendationFactor(value: unknown): RecommendationFactor | null {
  if (!isRecord(value)) {
    return null;
  }

  const fields = parseRecommendationFactorFields(value);
  if (!fields) {
    return null;
  }

  const { weight } = value;

  const factor: RecommendationFactor = {
    source: fields.source,
    label: fields.label,
    value: fields.value,
  };

  if (typeof weight === "number" && Number.isFinite(weight)) {
    factor.weight = weight;
  }

  return factor;
}

/** Validates one cached stock recommendation row from Redis JSON. */
function parseStockRecommendation(item: unknown): StockRecommendation | null {
  if (!isRecord(item)) {
    return null;
  }

  const fields = parseStockRecommendationFields(item);
  if (!fields) {
    return null;
  }

  const parsedFactors = fields.factors
    .map(parseRecommendationFactor)
    .filter((factor): factor is RecommendationFactor => factor !== null);

  return {
    id: fields.id,
    symbol: fields.symbol,
    name: fields.name,
    sector: fields.sector,
    action: fields.action,
    price: fields.price,
    confidence: fields.confidence,
    primarySource: fields.primarySource,
    summary: fields.summary,
    factors: parsedFactors,
    generatedAt: fields.generatedAt,
  };
}

/** Validates a cached recommendations array from Redis. */
export function parseStockRecommendations(value: unknown): StockRecommendation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const recommendations: StockRecommendation[] = [];

  for (const item of value) {
    const recommendation = parseStockRecommendation(item);
    if (recommendation) {
      recommendations.push(recommendation);
    }
  }

  return recommendations;
}
