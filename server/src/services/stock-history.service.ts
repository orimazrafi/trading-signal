import axios from "axios";
import { env } from "../config/env.js";
import { log } from "../lib/logger.js";
import { parseStockHistory } from "../lib/parseStockHistory.js";
import { buildTwelveDataApiUrl, requireTwelveDataApiKey, TWELVE_DATA_ENDPOINTS } from "../lib/twelveData.js";
import { redis } from "../config/redis.js";
import type { StockHistory, StockHistoryPoint, StockHistoryRange } from "../types/stockHistory.js";

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
    case "1D":
      return 13;
    case "1W":
      return 5;
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

/** Maps a dashboard range label to a Twelve Data interval. */
function resolveHistoryInterval(range: StockHistoryRange): string {
  if (range === "1D") {
    return "30min";
  }

  return "1day";
}

/** Normalizes a Twelve Data datetime string to a chart-compatible time value. */
function normalizeBarTime(datetime: string, isIntraday: boolean): string | number {
  if (!isIntraday) {
    return datetime.slice(0, 10);
  }

  const normalized = datetime.includes("T") ? datetime : datetime.replace(" ", "T");
  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) {
    return datetime.slice(0, 10);
  }

  return Math.floor(timestamp / 1000);
}

/** Builds the Redis cache key for a symbol history series. */
function buildHistoryCacheKey(symbol: string, range: StockHistoryRange): string {
  return `stock:history:${symbol}:${range}`;
}

/** Builds the Twelve Data time series URL for a symbol. */
function buildTimeSeriesUrl(symbol: string, range: StockHistoryRange, apiKey: string): string {
  return buildTwelveDataApiUrl(TWELVE_DATA_ENDPOINTS.timeSeries, {
    symbol,
    interval: resolveHistoryInterval(range),
    outputsize: String(resolveOutputSize(range)),
    apikey: apiKey,
    order: "ASC",
  });
}

/** Maps a Twelve Data bar to an internal history point. */
function mapTimeSeriesValue(value: TwelveDataTimeSeriesValue, isIntraday: boolean): StockHistoryPoint | null {
  const open = Number(value.open);
  const high = Number(value.high);
  const low = Number(value.low);
  const close = Number(value.close);
  const volume = Number(value.volume ?? 0);

  if ([open, high, low, close].some((price) => Number.isNaN(price))) {
    return null;
  }

  return {
    time: normalizeBarTime(value.datetime, isIntraday),
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
  const apiKey = requireTwelveDataApiKey();

  const { data } = await axios.get<TwelveDataTimeSeriesResponse>(
    buildTimeSeriesUrl(symbol, range, apiKey),
    { timeout: 10_000 },
  );

  if (data.code || data.status === "error") {
    throw new Error(data.message ?? `Twelve Data time series failed for ${symbol}`);
  }

  const isIntraday = range === "1D";
  const points = (data.values ?? [])
    .map((value) => mapTimeSeriesValue(value, isIntraday))
    .filter((point): point is StockHistoryPoint => point !== null);

  if (points.length === 0) {
    throw new Error(`No history data returned for ${symbol}`);
  }

  return {
    symbol,
    interval: resolveHistoryInterval(range),
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
