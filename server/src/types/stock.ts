export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  peRatio: number;
  sector: string;
}

export interface SearchStockResult {
  quote: StockQuote;
  recommendation: string;
  signalId: string;
}

export interface TrendingStock {
  symbol: string;
  score: number;
}

export type NewsSentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export interface NewsItem {
  headline: string;
  source: string;
  publishedAt: string;
  sentiment: NewsSentiment;
}

export interface StockTickMessage {
  symbol: string;
  price: number;
  userId: string;
}

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validates a RabbitMQ stock tick payload at runtime. */
export function parseStockTickMessage(payload: unknown): StockTickMessage | null {
  if (!isRecord(payload)) {
    return null;
  }

  const { symbol, price, userId } = payload;

  if (typeof symbol !== "string" || typeof userId !== "string") {
    return null;
  }

  if (typeof price !== "number" && typeof price !== "string") {
    return null;
  }

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) {
    return null;
  }

  return {
    symbol: symbol.toUpperCase(),
    price: numericPrice,
    userId,
  };
}

/** Validates cached stock quote JSON from Redis. */
export function parseStockQuote(value: unknown): StockQuote | null {
  if (!isRecord(value)) {
    return null;
  }

  const { symbol, name, price, peRatio, sector } = value;

  if (
    typeof symbol !== "string" ||
    typeof name !== "string" ||
    typeof sector !== "string" ||
    typeof price !== "number" ||
    typeof peRatio !== "number"
  ) {
    return null;
  }

  return { symbol, name, price, peRatio, sector };
}
