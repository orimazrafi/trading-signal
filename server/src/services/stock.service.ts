import axios from "axios";
import { env } from "../config/env.js";
import { log } from "../lib/logger.js";
import { redis } from "../config/redis.js";
import {
  createSignal,
  createSignalRecord,
} from "../repositories/signal.repository.js";
import { ensureUserExists } from "../repositories/user.repository.js";
import type {
  SearchStockResult,
  StockQuote,
  StockTickMessage,
  TrendingStock,
} from "../types/stock.js";
import { parseStockQuote } from "../types/stock.js";

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

/** Builds the Redis cache key for a stock quote. */
function buildQuoteCacheKey(symbol: string): string {
  return `stock:price:${symbol}`;
}

/** Reads a cached quote from Redis, or null on miss or parse failure. */
async function readCachedQuote(symbol: string): Promise<StockQuote | null> {
  const cacheKey = buildQuoteCacheKey(symbol);

  try {
    const cached = await redis.get(cacheKey);
    if (!cached) {
      return null;
    }

    return parseStockQuote(JSON.parse(cached));
  } catch (error) {
    log.error("Redis read failed", error, { symbol, cacheKey });
    return null;
  }
}

/** Reads a cached quote from Redis, or null on miss or parse failure. */
export async function getCachedStockQuote(symbol: string): Promise<StockQuote | null> {
  return readCachedQuote(symbol);
}

/** Builds the Twelve Data quote URL for a symbol. */
function buildTwelveDataQuoteUrl(symbol: string, apiKey: string): string {
  return `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;
}

/** Returns true when Twelve Data responded with an error payload. */
function isTwelveDataErrorPayload(data: unknown): boolean {
  return isRecord(data) && ("code" in data || "status" in data) && !("close" in data || "price" in data);
}

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Builds the Twelve Data profile URL for a symbol. */
function buildTwelveDataProfileUrl(symbol: string, apiKey: string): string {
  return `https://api.twelvedata.com/profile?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;
}

type TwelveDataProfileResponse = {
  name?: string;
  sector?: string;
  industry?: string;
  code?: number;
  message?: string;
  status?: string;
};

/** Maps a Twelve Data API payload to a StockQuote. */
function mapTwelveDataQuote(
  symbol: string,
  data: Record<string, unknown>,
  profile?: TwelveDataProfileResponse,
): StockQuote {
  return {
    symbol,
    name: String(profile?.name ?? data.name ?? `${symbol} Inc.`),
    price: Number(data.close ?? data.price ?? 0),
    peRatio: Number(data.pe ?? data.trailing_pe ?? 0),
    sector: String(profile?.sector ?? profile?.industry ?? data.sector ?? data.industry ?? "Unknown"),
  };
}

/** Fetches company profile metadata used to enrich quote responses. */
async function fetchProfileFromApi(
  symbol: string,
  apiKey: string,
): Promise<TwelveDataProfileResponse | null> {
  try {
    const response = await axios.get<TwelveDataProfileResponse>(
      buildTwelveDataProfileUrl(symbol, apiKey),
      { timeout: 8000 },
    );

    if (response.data.code || response.data.status === "error") {
      throw new Error(response.data.message ?? `Twelve Data profile failed for ${symbol}`);
    }

    return response.data;
  } catch (error) {
    log.error("External API fetch failed", error, { provider: "Twelve Data", symbol, endpoint: "profile" });
    return null;
  }
}

/** Fetches a quote from Twelve Data; throws when the API key is missing or the request fails. */
async function fetchQuoteFromApi(symbol: string): Promise<StockQuote> {
  const apiKey = env.twelveDataApiKey?.trim();

  if (!apiKey) {
    throw new Error("TWELVE_DATA_API_KEY not configured");
  }

  const [quoteResponse, profile] = await Promise.all([
    axios.get(buildTwelveDataQuoteUrl(symbol, apiKey), { timeout: 8000 }),
    fetchProfileFromApi(symbol, apiKey),
  ]);

  if (isTwelveDataErrorPayload(quoteResponse.data)) {
    throw new Error(`Twelve Data error: ${JSON.stringify(quoteResponse.data)}`);
  }

  return mapTwelveDataQuote(symbol, quoteResponse.data as Record<string, unknown>, profile ?? undefined);
}

/** Writes a quote to Redis with TTL; logs but does not throw on failure. */
async function cacheQuote(symbol: string, quote: StockQuote): Promise<void> {
  const cacheKey = buildQuoteCacheKey(symbol);

  try {
    await redis.set(cacheKey, JSON.stringify(quote), "EX", env.stockCacheTtlSeconds);
    log.info("Cached stock quote in Redis", { symbol, ttlSeconds: env.stockCacheTtlSeconds });
  } catch (error) {
    log.error("Redis write failed", error, { symbol, cacheKey });
  }
}

/** Returns cached stock quote or fetches live data from Twelve Data. */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const normalizedSymbol = normalizeSymbol(symbol);

  const cached = await readCachedQuote(normalizedSymbol);
  if (cached) {
    return cached;
  }

  log.warn("Cache miss for dynamic data, fetching from external provider", {
    symbol: normalizedSymbol,
  });

  const quote = await fetchQuoteFromApi(normalizedSymbol);
  await cacheQuote(normalizedSymbol, quote);
  return quote;
}

/** Derives a BUY/HOLD recommendation from the PE ratio. */
function resolvePeRecommendation(peRatio: number): "BUY" | "HOLD" {
  if (peRatio > 0 && peRatio <= 25) {
    return "BUY";
  }

  return "HOLD";
}

/** Persists a search signal for the user and returns the recommendation payload. */
async function persistSearchSignal(
  userId: string,
  quote: StockQuote,
  recommendation: string,
): Promise<SearchStockResult> {
  const previousPrice = await readPreviousPrice(quote.symbol, quote.price);
  const changePercent = calculateChangePercent(previousPrice, quote.price);

  const signal = await createSignalRecord({
    userId,
    symbol: quote.symbol,
    recommendation,
    price: quote.price,
    previousPrice,
    changePercent,
  });

  log.info("Persisted search signal to PostgreSQL", {
    userId,
    symbol: quote.symbol,
    signalId: signal.id,
  });

  return {
    quote,
    recommendation,
    signalId: signal.id,
  };
}

/** Searches a stock, caches the quote, generates a recommendation, and saves a signal. */
export async function searchStock(userId: string, symbol: string): Promise<SearchStockResult> {
  const normalizedSymbol = normalizeSymbol(symbol);
  const quote = await getStockQuote(normalizedSymbol);
  const recommendation = resolvePeRecommendation(quote.peRatio);

  return persistSearchSignal(userId, quote, recommendation);
}

/** Reads top trending symbols for the authenticated user from Redis. */
export async function getTrendingStocks(userId: string): Promise<TrendingStock[]> {
  const leaderboardKey = `leaderboard:${userId}`;
  const entries = await redis.zrevrange(leaderboardKey, 0, 4, "WITHSCORES");

  const trending: TrendingStock[] = [];
  for (let index = 0; index < entries.length; index += 2) {
    trending.push({
      symbol: entries[index],
      score: Number(entries[index + 1]),
    });
  }

  return trending;
}

/** Calculates percent change between previous and current price. */
function calculateChangePercent(previousPrice: number, currentPrice: number): number {
  if (previousPrice <= 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/** Builds the Redis key for a symbol's last seen price. */
function buildLastPriceKey(symbol: string): string {
  return `last_price:${symbol}`;
}

/** Builds the Redis leaderboard key for a user. */
function buildLeaderboardKey(userId: string): string {
  return `leaderboard:${userId}`;
}

/** Reads the previous price from Redis, or the current price when none exists. */
async function readPreviousPrice(symbol: string, fallbackPrice: number): Promise<number> {
  const raw = await redis.get(buildLastPriceKey(symbol));
  return raw ? Number(raw) : fallbackPrice;
}

/** Returns true when the price change meets the surge threshold. */
function isSurgeDetected(changePercent: number): boolean {
  return changePercent >= env.surgeThresholdPercent;
}

/** Maps change percent to a buy recommendation tier. */
function resolveRecommendation(changePercent: number): string {
  return changePercent >= 3 ? "STRONG_BUY" : "BUY";
}

/** Persists a surge signal when the change exceeds the threshold. */
async function persistSurgeSignal(
  tick: StockTickMessage,
  previousPrice: number,
  changePercent: number,
): Promise<void> {
  const recommendation = resolveRecommendation(changePercent);

  await ensureUserExists(tick.userId, `${tick.userId}@ticks.local`);

  await createSignal({
    userId: tick.userId,
    symbol: tick.symbol,
    recommendation,
    price: tick.price,
    previousPrice,
    changePercent,
  });

  log.info("Persisted surge signal to PostgreSQL", {
    userId: tick.userId,
    symbol: tick.symbol,
    recommendation,
    changePercent,
  });
}

/** Updates last price and leaderboard score for the tick. */
async function updatePriceAndLeaderboard(
  tick: StockTickMessage,
  changePercent: number,
): Promise<void> {
  const lastPriceKey = buildLastPriceKey(tick.symbol);
  const leaderboardKey = buildLeaderboardKey(tick.userId);

  await redis.set(lastPriceKey, String(tick.price));
  await redis.zadd(leaderboardKey, changePercent, tick.symbol);

  log.info("Updated tick leaderboard in Redis", {
    userId: tick.userId,
    symbol: tick.symbol,
    leaderboardKey,
    changePercent,
  });
}

/** Processes one stock tick: detect surge, persist signal, update leaderboard. */
export async function processStockTick(tick: StockTickMessage): Promise<void> {
  const previousPrice = await readPreviousPrice(tick.symbol, tick.price);
  const changePercent = calculateChangePercent(previousPrice, tick.price);

  log.info("Processing stock tick", {
    symbol: tick.symbol,
    price: tick.price,
    changePercent,
  });

  if (isSurgeDetected(changePercent)) {
    await persistSurgeSignal(tick, previousPrice, changePercent);
  }

  await updatePriceAndLeaderboard(tick, changePercent);
}
