import { redis } from "../config/redis.js";

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

/** Reads the previous price from Redis, or the current price when none exists. */
export async function readPreviousPrice(symbol: string, fallbackPrice: number): Promise<number> {
  const raw = await redis.get(buildLastPriceKey(symbol));
  return raw ? Number(raw) : fallbackPrice;
}

/** Stores the latest seen price for change-percent calculations on search. */
export async function writeLastSeenPrice(symbol: string, price: number): Promise<void> {
  await redis.set(buildLastPriceKey(symbol), String(price));
}
