import type { RecommendationQuery } from "../services/recommendation.service.js";
import { isRecommendationSource } from "../types/recommendation.js";

/** Parses an optional sector filter from a query string value. */
function parseSectorFilter(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** Parses comma-separated recommendation source filters from a query string value. */
function parseSourceFilters(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const sources = value
    .split(",")
    .map((source) => source.trim().toLowerCase())
    .filter(isRecommendationSource);

  return sources.length > 0 ? sources : undefined;
}

/** Maps dashboard recommendation query params to a service filter object. */
export function parseRecommendationQuery(query: Record<string, unknown>): RecommendationQuery {
  return {
    sector: parseSectorFilter(query.sector),
    sources: parseSourceFilters(query.source),
  };
}
