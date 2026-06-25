import { env } from "../config/env.js";
import { log } from "../lib/logger/index.js";
import { parseStockHistory } from "../lib/parseStockHistory.js";
import { readJsonBackupFromRedis, readJsonFromRedis, writeJsonToRedis } from "../lib/redisJsonCache.js";
import { toStockProviderError } from "../lib/stockProviderErrors.js";
import { getHistoryMarketDataProvider } from "../providers/marketData/index.js";
import { resolveHistoryProviderId } from "../providers/marketData/resolveHistoryProviderId.js";
import type { StockHistory, StockHistoryRange } from "../types/stockHistory.js";

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

/** Builds the Redis cache key for a symbol history series. */
function buildHistoryCacheKey(symbol: string, range: StockHistoryRange): string {
  return `stock:history:${symbol}:${range}`;
}

/** Writes history to Redis with TTL; logs but does not throw on failure. */
async function cacheHistory(history: StockHistory): Promise<void> {
  const cacheKey = buildHistoryCacheKey(history.symbol, history.range);

  await writeJsonToRedis(cacheKey, history, {
    ttlSeconds: env.stockHistoryCacheTtlSeconds,
    backup: true,
    logMessage: "Cached stock history in Redis",
    logContext: {
      symbol: history.symbol,
      range: history.range,
      pointCount: history.points.length,
      ttlSeconds: env.stockHistoryCacheTtlSeconds,
    },
  });
}

/** Returns cached daily history or fetches from the market data provider on miss. */
export async function getStockHistory(
  symbol: string,
  range: StockHistoryRange,
): Promise<StockHistory> {
  const normalizedSymbol = normalizeSymbol(symbol);
  const cacheKey = buildHistoryCacheKey(normalizedSymbol, range);
  const cachedHistory = await readJsonFromRedis(cacheKey, parseStockHistory, {
    symbol: normalizedSymbol,
    range,
  });

  if (cachedHistory) {
    return cachedHistory;
  }

  log.warn("Cache miss for dynamic data, fetching from external provider", {
    symbol: normalizedSymbol,
    range,
    provider: env.marketDataProvider,
    historyProvider: resolveHistoryProviderId(
      env.marketDataProvider,
      env.marketDataHistoryProvider || undefined,
    ),
  });

  try {
    const history = await getHistoryMarketDataProvider().fetchHistory(normalizedSymbol, range);
    await cacheHistory(history);
    return history;
  } catch (error) {
    const backupHistory = await readJsonBackupFromRedis(cacheKey, parseStockHistory, {
      symbol: normalizedSymbol,
      range,
    });

    if (backupHistory) {
      log.warn("Serving backup stock history after provider failure", {
        symbol: normalizedSymbol,
        range,
      });
      return backupHistory;
    }

    throw toStockProviderError(error, `history for ${normalizedSymbol}`);
  }
}
