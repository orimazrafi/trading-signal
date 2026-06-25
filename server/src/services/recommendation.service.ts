import { env } from "../config/env.js";
import {
  RECOMMENDATIONS_EMPTY_MESSAGE,
  RECOMMENDATIONS_UNAVAILABLE_MESSAGE,
} from "../lib/recommendationConstants.js";
import { log } from "../lib/logger/index.js";
import { parseStockRecommendations } from "../lib/parseRecommendations/index.js";
import { readJsonFromRedis, writeJsonToRedis } from "../lib/redisJsonCache.js";
import { getStockQuote } from "./stock-quote.service.js";
import type { StockQuote } from "../types/stock.js";
import type {
  RecommendationAction,
  RecommendationFactor,
  RecommendationSource,
  StockRecommendation,
} from "../types/recommendation.js";

export type RecommendationQuery = {
  sector?: string;
  sources?: RecommendationSource[];
};

export type RecommendationsFeedResult = {
  recommendations: StockRecommendation[];
  emptyMessage?: string;
};

/** Builds recommendations from fetched quotes and writes them to Redis. */
function buildRecommendationsFromQuotes(quotes: StockQuote[]): StockRecommendation[] {
  const sectorAverages = buildSectorAveragePeMap(quotes);
  const generatedAt = new Date().toISOString();

  return quotes
    .map((quote) => buildRecommendation(quote, sectorAverages.get(quote.sector) ?? 0, generatedAt))
    .sort((left, right) => {
      const actionRank = (action: RecommendationAction) => {
        if (action === "STRONG_BUY") return 0;
        if (action === "BUY") return 1;
        return 2;
      };

      const rankDiff = actionRank(left.action) - actionRank(right.action);
      if (rankDiff !== 0) {
        return rankDiff;
      }

      return right.confidence - left.confidence;
    })
    .slice(0, env.recommendationsMaxItems);
}

/** Returns a user-facing empty-state message for the ideas feed. */
function resolveRecommendationsEmptyMessage(quoteCount: number | null): string {
  if (quoteCount === 0) {
    return RECOMMENDATIONS_UNAVAILABLE_MESSAGE;
  }

  return RECOMMENDATIONS_EMPTY_MESSAGE;
}

/** Maps a P/E ratio to a fundamental buy/hold action. */
function resolveFundamentalAction(peRatio: number): RecommendationAction {
  if (peRatio > 0 && peRatio <= 15) {
    return "STRONG_BUY";
  }

  if (peRatio > 15 && peRatio <= 25) {
    return "BUY";
  }

  return "HOLD";
}

/** Builds a 0–100 confidence score from valuation and sector context. */
function resolveConfidence(peRatio: number, sectorAveragePe: number): number {
  if (peRatio <= 0) {
    return 40;
  }

  let score = 100 - peRatio * 2.5;

  if (sectorAveragePe > 0 && peRatio < sectorAveragePe) {
    score += 10;
  }

  return Math.max(35, Math.min(95, Math.round(score)));
}

/** Summarizes the recommendation in one sentence for the dashboard card. */
function buildSummary(action: RecommendationAction, quote: StockQuote, sectorAveragePe: number): string {
  if (action === "STRONG_BUY") {
    return `${quote.symbol} trades at an attractive P/E of ${quote.peRatio.toFixed(1)} in ${quote.sector}.`;
  }

  if (action === "BUY") {
    return `${quote.symbol} P/E (${quote.peRatio.toFixed(1)}) is within the buy range for ${quote.sector}.`;
  }

  if (sectorAveragePe > 0 && quote.peRatio > sectorAveragePe) {
    return `${quote.symbol} P/E is above the ${quote.sector} sector average (${sectorAveragePe.toFixed(1)}).`;
  }

  return `${quote.symbol} valuation is outside the current buy thresholds.`;
}

/** Builds factor rows for a single stock recommendation. */
function buildFactors(
  quote: StockQuote,
  sectorAveragePe: number,
  action: RecommendationAction,
): RecommendationFactor[] {
  const factors: RecommendationFactor[] = [
    {
      source: "fundamental",
      label: "P/E ratio",
      value: quote.peRatio.toFixed(2),
      weight: 0.6,
    },
  ];

  if (sectorAveragePe > 0) {
    const relative =
      quote.peRatio <= sectorAveragePe ? "Below sector average" : "Above sector average";

    factors.push({
      source: "sector",
      label: `${quote.sector} avg P/E`,
      value: `${sectorAveragePe.toFixed(1)} · ${relative}`,
      weight: 0.4,
    });
  }

  if (action === "HOLD") {
    factors.push({
      source: "fundamental",
      label: "Valuation",
      value: "Outside buy range (0–25 P/E)",
      weight: 0.2,
    });
  }

  return factors;
}

/** Computes the average P/E for each sector in the quote universe. */
function buildSectorAveragePeMap(quotes: StockQuote[]): Map<string, number> {
  const totals = new Map<string, { sum: number; count: number }>();

  for (const quote of quotes) {
    if (quote.peRatio <= 0) {
      continue;
    }

    const bucket = totals.get(quote.sector) ?? { sum: 0, count: 0 };
    bucket.sum += quote.peRatio;
    bucket.count += 1;
    totals.set(quote.sector, bucket);
  }

  const averages = new Map<string, number>();

  for (const [sector, { sum, count }] of totals) {
    averages.set(sector, sum / count);
  }

  return averages;
}

/** Builds one recommendation card from a quote and sector context. */
function buildRecommendation(
  quote: StockQuote,
  sectorAveragePe: number,
  generatedAt: string,
): StockRecommendation {
  const action = resolveFundamentalAction(quote.peRatio);
  const confidence = resolveConfidence(quote.peRatio, sectorAveragePe);
  const primarySource: RecommendationSource =
    action === "HOLD" ? "fundamental" : sectorAveragePe > 0 ? "sector" : "fundamental";

  return {
    id: `rec-${quote.symbol}`,
    symbol: quote.symbol,
    name: quote.name,
    sector: quote.sector,
    action,
    price: quote.price,
    confidence,
    primarySource,
    summary: buildSummary(action, quote, sectorAveragePe),
    factors: buildFactors(quote, sectorAveragePe, action),
    generatedAt,
  };
}

/** Reads processed recommendations from Redis, or null on cache miss. */
async function readRecommendationsFromRedis(): Promise<StockRecommendation[] | null> {
  return readJsonFromRedis(env.dashboardRecommendationsRedisKey, parseStockRecommendations, {
    key: env.dashboardRecommendationsRedisKey,
  });
}

/** Persists the recommendations feed back to Redis. */
async function saveRecommendationsToRedis(recommendations: StockRecommendation[]): Promise<void> {
  await writeJsonToRedis(env.dashboardRecommendationsRedisKey, recommendations, {
    ttlSeconds: env.dashboardRecommendationsCacheTtlSeconds,
    logMessage: "Cached dashboard recommendations in Redis",
    logContext: {
      key: env.dashboardRecommendationsRedisKey,
      recommendationCount: recommendations.length,
      ttlSeconds: env.dashboardRecommendationsCacheTtlSeconds,
    },
  });
}

/** Applies optional sector and source filters to a recommendations list. */
function filterRecommendations(
  recommendations: StockRecommendation[],
  query: RecommendationQuery,
): StockRecommendation[] {
  let filtered = recommendations;

  if (query.sector) {
    const normalizedSector = query.sector.trim().toLowerCase();
    filtered = filtered.filter(
      (recommendation) => recommendation.sector.toLowerCase() === normalizedSector,
    );
  }

  if (query.sources && query.sources.length > 0) {
    const allowed = new Set(query.sources);
    filtered = filtered.filter(
      (recommendation) =>
        allowed.has(recommendation.primarySource) ||
        recommendation.factors.some((factor: RecommendationFactor) => allowed.has(factor.source)),
    );
  }

  return filtered;
}

/** Fetches quotes for the configured symbol universe. */
async function fetchUniverseQuotes(): Promise<StockQuote[]> {
  const quotes: StockQuote[] = [];

  for (const symbol of env.recommendationSymbols) {
    try {
      quotes.push(await getStockQuote(symbol));
    } catch (error) {
      log.error("Failed to fetch quote for recommendation universe", error, { symbol });
    }
  }

  return quotes;
}

/** Computes and stores the dashboard recommendations feed. */
export class RecommendationService {
  /** Recomputes recommendations from live quotes and writes them to Redis. */
  async refreshRecommendations(): Promise<StockRecommendation[]> {
    const quotes = await fetchUniverseQuotes();
    const recommendations = buildRecommendationsFromQuotes(quotes);

    await saveRecommendationsToRedis(recommendations);

    log.info("Refreshed dashboard recommendations", {
      universeSize: quotes.length,
      recommendationCount: recommendations.length,
    });

    return recommendations;
  }

  /** Returns the compiled recommendations feed, refreshing on Redis cache miss. */
  async getRecommendations(query: RecommendationQuery = {}): Promise<RecommendationsFeedResult> {
    let recommendations = await readRecommendationsFromRedis();
    let quoteCount: number | null = null;

    if (recommendations === null) {
      log.warn("Cache miss for dynamic data, fetching from external provider", {
        key: env.dashboardRecommendationsRedisKey,
      });

      const quotes = await fetchUniverseQuotes();
      quoteCount = quotes.length;
      recommendations = buildRecommendationsFromQuotes(quotes);
      await saveRecommendationsToRedis(recommendations);
    }

    const filtered = filterRecommendations(recommendations, query);
    const emptyMessage =
      filtered.length === 0 ? resolveRecommendationsEmptyMessage(quoteCount) : undefined;

    return {
      recommendations: filtered,
      emptyMessage,
    };
  }
}

/** Shared recommendation service instance for jobs and HTTP handlers. */
export const recommendationService = new RecommendationService();
