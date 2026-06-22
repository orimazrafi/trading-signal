import axios from "axios";
import { env } from "../config/env.js";
import { log } from "../lib/logger.js";
import { parseStockHistory } from "../lib/parseStockHistory.js";
import { buildTwelveDataApiUrl, TWELVE_DATA_ENDPOINTS } from "../lib/twelveData.js";
import { redis } from "../config/redis.js";
import type { StockHistory, StockHistoryPoint, StockHistoryRange } from "../types/stockHistory.js";

const HISTORY_INTERVAL = "1day";

type TwelveDataTimeSeriesValue = {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
};

type TwelveDataTimeSeriesResponse = {
  status?: string;
  code?: number;
  message?: string;
  values?: TwelveDataTimeSeriesValue[];
};

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

/** Maps a dashboard range label to Twelve Data outputsize. */
function resolveOutputSize(range: StockHistoryRange): number {
  switch (range) {
    case "1M":
      return 22;
    case "3M":
      return 66;
    case "6M":
      return 132;
    case "1Y":
      return 252;
  }
}

/** Builds the Redis cache key for a symbol history series. */
function buildHistoryCacheKey(symbol: string, range: StockHistoryRange): string {
  return `stock:history:${symbol}:${range}`;
}

/** Builds the Twelve Data time series URL for a symbol. */
function buildTimeSeriesUrl(symbol: string, range: StockHistoryRange, apiKey: string): string {
  return buildTwelveDataApiUrl(TWELVE_DATA_ENDPOINTS.timeSeries, {
    symbol,
    interval: HISTORY_INTERVAL,
    outputsize: String(resolveOutputSize(range)),
    apikey: apiKey,
    order: "ASC",
  });
}

/** Maps a Twelve Data bar to an internal history point. */
function mapTimeSeriesValue(value: TwelveDataTimeSeriesValue): StockHistoryPoint | null {
  const open = Number(value.open);
  const high = Number(value.high);
  const low = Number(value.low);
  const close = Number(value.close);
  const volume = Number(value.volume ?? 0);

  if ([open, high, low, close].some((price) => Number.isNaN(price))) {
    return null;
  }

  return {
    time: value.datetime.slice(0, 10),
    open,
    high,
    low,
    close,
    volume: Number.isNaN(volume) ? 0 : volume,
  };
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

/** Writes history to Redis with TTL; logs but does not throw on failure. */
async function cacheHistory(history: StockHistory): Promise<void> {
  const cacheKey = buildHistoryCacheKey(history.symbol, history.range);

  try {
    await redis.set(cacheKey, JSON.stringify(history), "EX", env.stockHistoryCacheTtlSeconds);
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

/** Fetches daily OHLCV bars from Twelve Data. */
async function fetchHistoryFromApi(
  symbol: string,
  range: StockHistoryRange,
): Promise<StockHistory> {
  const apiKey = env.twelveDataApiKey?.trim();

  if (!apiKey) {
    throw new Error("TWELVE_DATA_API_KEY not configured");
  }

  const { data } = await axios.get<TwelveDataTimeSeriesResponse>(
    buildTimeSeriesUrl(symbol, range, apiKey),
    { timeout: 10_000 },
  );

  if (data.code || data.status === "error") {
    throw new Error(data.message ?? `Twelve Data time series failed for ${symbol}`);
  }

  const points = (data.values ?? [])
    .map((value) => mapTimeSeriesValue(value))
    .filter((point): point is StockHistoryPoint => point !== null);

  if (points.length === 0) {
    throw new Error(`No history data returned for ${symbol}`);
  }

  return {
    symbol,
    interval: HISTORY_INTERVAL,
    range,
    points,
  };
}

/** Returns cached daily history or fetches from Twelve Data on miss. */
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
  });

  const history = await fetchHistoryFromApi(normalizedSymbol, range);
  await cacheHistory(history);
  return history;
}
