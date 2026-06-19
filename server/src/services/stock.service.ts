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

/** Returns cached stock quote or fetches from Twelve Data with mock fallback. */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const normalizedSymbol = symbol.toUpperCase();
  const cacheKey = `stock:price:${normalizedSymbol}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[stock] Cache hit for ${normalizedSymbol}`);
      const parsed = parseStockQuote(JSON.parse(cached));
      if (parsed) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(`[stock] Redis read failed for ${normalizedSymbol}:`, error);
  }

  let quote: StockQuote;

  try {
    if (env.twelveDataApiKey) {
      const response = await axios.get("https://api.twelvedata.com/quote", {
        params: { symbol: normalizedSymbol, apikey: env.twelveDataApiKey },
        timeout: 8000,
      });

      quote = {
        symbol: normalizedSymbol,
        name: String(response.data.name ?? `${normalizedSymbol} Inc.`),
        price: Number(response.data.close ?? response.data.price ?? 0),
        peRatio: Number(response.data.pe ?? 0),
        sector: String(response.data.sector ?? "Unknown"),
      };
    } else {
      throw new Error("TWELVE_DATA_API_KEY not configured");
    }
  } catch (error) {
    console.warn(
      `[stock] External API unavailable for ${normalizedSymbol}, using mock payload:`,
      error,
    );
    quote = buildMockQuote(normalizedSymbol);
  }

  try {
    await redis.set(cacheKey, JSON.stringify(quote), "EX", env.stockCacheTtlSeconds);
    console.log(`[stock] Cached ${normalizedSymbol} for ${env.stockCacheTtlSeconds}s`);
  } catch (error) {
    console.error(`[stock] Redis write failed for ${normalizedSymbol}:`, error);
  }

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

/** Processes one stock tick: detect surge, persist signal, update leaderboard. */
export async function processStockTick(tick: StockTickMessage): Promise<void> {
  const lastPriceKey = `last_price:${tick.symbol}`;
  const leaderboardKey = `leaderboard:${tick.userId}`;

  const previousPriceRaw = await redis.get(lastPriceKey);
  const previousPrice = previousPriceRaw ? Number(previousPriceRaw) : tick.price;
  const changePercent = calculateChangePercent(previousPrice, tick.price);

  console.log(
    `[worker] Tick ${tick.symbol} @ ${tick.price} (${changePercent.toFixed(2)}% vs last)`,
  );

  if (changePercent >= env.surgeThresholdPercent) {
    const recommendation = changePercent >= 3 ? "STRONG_BUY" : "BUY";

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

  await redis.set(lastPriceKey, String(tick.price));
  await redis.zadd(leaderboardKey, changePercent, tick.symbol);
  console.log(`[worker] Updated leaderboard ${leaderboardKey} for ${tick.symbol}`);
}
