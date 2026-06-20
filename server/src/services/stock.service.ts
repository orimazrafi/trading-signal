import axios from "axios";
import { env } from "../config/env.js";
import { redis } from "../config/redis.js";
import { createSignal } from "../repositories/signal.repository.js";
import { ensureUserExists } from "../repositories/user.repository.js";
import type {
  NewsItem,
  NewsSentiment,
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

    console.log(`[stock] Cache hit for ${symbol}`);
    return parseStockQuote(JSON.parse(cached));
  } catch (error) {
    console.error(`[stock] Redis read failed for ${symbol}:`, error);
    return null;
  }
}

/** Maps a Twelve Data API payload to a StockQuote. */
function mapTwelveDataQuote(symbol: string, data: Record<string, unknown>): StockQuote {
  return {
    symbol,
    name: String(data.name ?? `${symbol} Inc.`),
    price: Number(data.close ?? data.price ?? 0),
    peRatio: Number(data.pe ?? 0),
    sector: String(data.sector ?? "Unknown"),
  };
}

/** Fetches a quote from Twelve Data; throws when the API key is missing or the request fails. */
async function fetchQuoteFromApi(symbol: string): Promise<StockQuote> {
  if (!env.twelveDataApiKey) {
    throw new Error("TWELVE_DATA_API_KEY not configured");
  }

  const response = await axios.get("https://api.twelvedata.com/quote", {
    params: { symbol, apikey: env.twelveDataApiKey },
    timeout: 8000,
  });

  return mapTwelveDataQuote(symbol, response.data);
}

/** Fetches a live quote or falls back to deterministic mock data. */
async function fetchQuoteWithFallback(symbol: string): Promise<StockQuote> {
  try {
    return await fetchQuoteFromApi(symbol);
  } catch (error) {
    console.warn(
      `[stock] External API unavailable for ${symbol}, using mock payload:`,
      error,
    );
    return buildMockQuote(symbol);
  }
}

/** Writes a quote to Redis with TTL; logs but does not throw on failure. */
async function cacheQuote(symbol: string, quote: StockQuote): Promise<void> {
  const cacheKey = buildQuoteCacheKey(symbol);

  try {
    await redis.set(cacheKey, JSON.stringify(quote), "EX", env.stockCacheTtlSeconds);
    console.log(`[stock] Cached ${symbol} for ${env.stockCacheTtlSeconds}s`);
  } catch (error) {
    console.error(`[stock] Redis write failed for ${symbol}:`, error);
  }
}

/** Returns cached stock quote or fetches from Twelve Data with mock fallback. */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const normalizedSymbol = normalizeSymbol(symbol);

  const cached = await readCachedQuote(normalizedSymbol);
  if (cached) {
    return cached;
  }

  const quote = await fetchQuoteWithFallback(normalizedSymbol);
  await cacheQuote(normalizedSymbol, quote);
  return quote;
}

/** Builds deterministic mock market data when the external API is unavailable. */
function buildMockQuote(symbol: string): StockQuote {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    symbol,
    name: `${symbol} Holdings`,
    price: Number((80 + (seed % 400) + Math.random()).toFixed(2)),
    peRatio: Number((12 + (seed % 20)).toFixed(2)),
    sector: ["Technology", "Finance", "Healthcare", "Energy"][seed % 4],
  };
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

/** Derives sentiment from simple bullish/bearish keyword matching. */
function scoreSentiment(headline: string): NewsSentiment {
  const text = headline.toLowerCase();
  const positiveKeywords = ["surge", "gain", "rally", "beat", "growth", "record", "upgrade"];
  const negativeKeywords = ["drop", "fall", "loss", "miss", "decline", "downgrade", "selloff"];

  const positiveHits = positiveKeywords.filter((word) => text.includes(word)).length;
  const negativeHits = negativeKeywords.filter((word) => text.includes(word)).length;

  if (positiveHits > negativeHits) return "POSITIVE";
  if (negativeHits > positiveHits) return "NEGATIVE";
  return "NEUTRAL";
}

/** Returns mocked financial headlines with basic sentiment scoring. */
export function getMarketNews(): NewsItem[] {
  const headlines = [
    "Tech stocks surge as earnings beat analyst expectations",
    "Energy sector faces decline amid global demand concerns",
    "Major bank reports record quarterly growth in trading revenue",
    "Retail giants miss earnings targets, shares fall sharply",
    "Healthcare rally continues after positive FDA approval news",
  ];

  return headlines.map((headline, index) => ({
    headline,
    source: "Trading Signal Wire",
    publishedAt: new Date(Date.now() - index * 3_600_000).toISOString(),
    sentiment: scoreSentiment(headline),
  }));
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

/** Logs an incoming tick with its change vs the last price. */
function logTickReceived(tick: StockTickMessage, changePercent: number): void {
  console.log(
    `[worker] Tick ${tick.symbol} @ ${tick.price} (${changePercent.toFixed(2)}% vs last)`,
  );
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

  console.log(
    `[worker] Signal created for ${tick.symbol}: ${recommendation} (${changePercent.toFixed(2)}%)`,
  );
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
  console.log(`[worker] Updated leaderboard ${leaderboardKey} for ${tick.symbol}`);
}

/** Processes one stock tick: detect surge, persist signal, update leaderboard. */
export async function processStockTick(tick: StockTickMessage): Promise<void> {
  const previousPrice = await readPreviousPrice(tick.symbol, tick.price);
  const changePercent = calculateChangePercent(previousPrice, tick.price);

  logTickReceived(tick, changePercent);

  if (isSurgeDetected(changePercent)) {
    await persistSurgeSignal(tick, previousPrice, changePercent);
  }

  await updatePriceAndLeaderboard(tick, changePercent);
}
