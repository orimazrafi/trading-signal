import { env } from "../config/env.js";
import { log } from "../lib/logger/index.js";
import { redis } from "../config/redis.js";
import { createSignal } from "../repositories/signal.repository.js";
import { ensureUserExists } from "../repositories/user.repository.js";
import type { StockTickMessage, TrendingStock } from "../types/stock.js";

/** Calculates percent change between previous and current price. */
export function calculateChangePercent(previousPrice: number, currentPrice: number): number {
  if (previousPrice <= 0) {
    return 0;
  }

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
export async function readPreviousPrice(symbol: string, fallbackPrice: number): Promise<number> {
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

/** Reads top trending symbols for the authenticated user from Redis. */
export async function getTrendingStocks(userId: string): Promise<TrendingStock[]> {
  const leaderboardKey = buildLeaderboardKey(userId);
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
