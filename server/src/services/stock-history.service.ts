import { env } from "../config/env.js";
import { log } from "../lib/logger/index.js";
import { parseStockHistory } from "../lib/parseStockHistory.js";
import { buildBackupCacheKey } from "../lib/redisBackupCache.js";
import { toStockProviderError } from "../lib/stockProviderErrors.js";
import { getHistoryMarketDataProvider } from "../providers/marketData/index.js";
import { resolveHistoryProviderId } from "../providers/marketData/resolveHistoryProviderId.js";
import { redis } from "../config/redis.js";
import type { StockHistory, StockHistoryRange } from "../types/stockHistory.js";

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

/** Builds the Redis cache key for a symbol history series. */
function buildHistoryCacheKey(symbol: string, range: StockHistoryRange): string {
  return `stock:history:${symbol}:${range}`;
}

/** Reads cached history from Redis, or null on miss. */
async function readCachedHistory(
  symbol: string,
  range: StockHistoryRange,
): Promise<StockHistory | null> {
  const cacheKey = buildHistoryCacheKey(symbol, range);

  try {
    const cached = await redis.get(cacheKey);
    if (!cached) {
      return null;
    }

    return parseStockHistory(JSON.parse(cached));
  } catch (error) {
    log.error("Redis read failed", error, { symbol, cacheKey });
    return null;
  }
}

/** Reads backup history from Redis when the live provider is unavailable. */
async function readBackupHistory(
  symbol: string,
  range: StockHistoryRange,
): Promise<StockHistory | null> {
  const backupKey = buildBackupCacheKey(buildHistoryCacheKey(symbol, range));

  try {
    const cached = await redis.get(backupKey);
    if (!cached) {
      return null;
    }

    return parseStockHistory(JSON.parse(cached));
  } catch (error) {
    log.error("Redis backup read failed", error, { symbol, backupKey });
    return null;
  }
}

/** Writes history to Redis with TTL; logs but does not throw on failure. */
async function cacheHistory(history: StockHistory): Promise<void> {
  const cacheKey = buildHistoryCacheKey(history.symbol, history.range);
  const payload = JSON.stringify(history);

  try {
    await redis.set(cacheKey, payload, "EX", env.stockHistoryCacheTtlSeconds);
    await redis.set(buildBackupCacheKey(cacheKey), payload);
    log.info("Cached stock history in Redis", {
      symbol: history.symbol,
      range: history.range,
      pointCount: history.points.length,
      ttlSeconds: env.stockHistoryCacheTtlSeconds,
    });
  } catch (error) {
    log.error("Redis write failed", error, { symbol: history.symbol, cacheKey });
  }
}

/** Returns cached daily history or fetches from the market data provider on miss. */
export async function getStockHistory(
  symbol: string,
  range: StockHistoryRange,
): Promise<StockHistory> {
  const normalizedSymbol = normalizeSymbol(symbol);
  const cachedHistory = await readCachedHistory(normalizedSymbol, range);

  if (cachedHistory) {
    return cachedHistory;
  }

  log.warn("Cache miss for dynamic data, fetching from external provider", {
    symbol: normalizedSymbol,
    range,
    provider: env.marketDataProvider,
    historyProvider: resolveHistoryProviderId(
      env.marketDataProvider,
      process.env.MARKET_DATA_HISTORY_PROVIDER,
    ),
  });

  try {
    const history = await getHistoryMarketDataProvider().fetchHistory(normalizedSymbol, range);
    await cacheHistory(history);
    return history;
  } catch (error) {
    const backupHistory = await readBackupHistory(normalizedSymbol, range);
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
