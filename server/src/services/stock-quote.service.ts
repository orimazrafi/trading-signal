import { env } from "../config/env.js";
import { log } from "../lib/logger/index.js";
import { readJsonBackupFromRedis, readJsonFromRedis, writeJsonToRedis } from "../lib/redisJsonCache.js";
import { toStockProviderError } from "../lib/stockProviderErrors.js";
import { getMarketDataProvider } from "../providers/marketData/index.js";
import type { StockQuote } from "../types/stock.js";
import { parseStockQuote } from "../types/stock.js";

export { StockError } from "../lib/stockError.js";

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

/** Builds the Redis cache key for a stock quote. */
function buildQuoteCacheKey(symbol: string): string {
  return `stock:price:${symbol}`;
}

/** Fetches a quote from the configured market data provider. */
async function fetchQuoteFromProvider(symbol: string): Promise<StockQuote> {
  return getMarketDataProvider().fetchQuote(symbol);
}

/** Reads a cached quote from Redis, or null on miss or parse failure. */
async function readCachedQuote(symbol: string): Promise<StockQuote | null> {
  return readJsonFromRedis(buildQuoteCacheKey(symbol), parseStockQuote, { symbol });
}

/** Reads a backup quote from Redis when the live provider is unavailable. */
async function readBackupQuote(symbol: string): Promise<StockQuote | null> {
  return readJsonBackupFromRedis(buildQuoteCacheKey(symbol), parseStockQuote, { symbol });
}

/** Reads a cached quote from Redis, or null on miss or parse failure. */
export async function getCachedStockQuote(symbol: string): Promise<StockQuote | null> {
  return readCachedQuote(symbol);
}

/** Writes a quote to Redis with TTL; logs but does not throw on failure. */
async function cacheQuote(symbol: string, quote: StockQuote): Promise<void> {
  const cacheKey = buildQuoteCacheKey(symbol);

  await writeJsonToRedis(cacheKey, quote, {
    ttlSeconds: env.stockCacheTtlSeconds,
    backup: true,
    logMessage: "Cached stock quote in Redis",
    logContext: { symbol, ttlSeconds: env.stockCacheTtlSeconds },
  });
}

/** Returns the latest stock price using cache or the configured market data provider. */
export async function getStockPrice(symbol: string): Promise<number> {
  const normalizedSymbol = normalizeSymbol(symbol);
  const cached = await readCachedQuote(normalizedSymbol);

  if (cached && cached.price > 0) {
    return cached.price;
  }

  log.warn("Cache miss for stock price, fetching from external provider", {
    symbol: normalizedSymbol,
    provider: env.marketDataProvider,
  });

  const quote = await fetchQuoteFromProvider(normalizedSymbol);
  await cacheQuote(normalizedSymbol, quote);
  return quote.price;
}

/** Returns cached stock quote or fetches live data from the market data provider. */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const normalizedSymbol = normalizeSymbol(symbol);

  const cached = await readCachedQuote(normalizedSymbol);
  if (cached) {
    return cached;
  }

  log.warn("Cache miss for dynamic data, fetching from external provider", {
    symbol: normalizedSymbol,
    provider: env.marketDataProvider,
  });

  try {
    const quote = await fetchQuoteFromProvider(normalizedSymbol);
    await cacheQuote(normalizedSymbol, quote);
    return quote;
  } catch (error) {
    const backupQuote = await readBackupQuote(normalizedSymbol);
    if (backupQuote) {
      log.warn("Serving backup stock quote after provider failure", { symbol: normalizedSymbol });
      return backupQuote;
    }

    throw toStockProviderError(error, `quote for ${normalizedSymbol}`);
  }
}
