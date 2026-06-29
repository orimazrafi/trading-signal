import { log } from "../lib/logger/index.js";
import { createSignalRecord } from "../repositories/signal.repository.js";
import type { SearchStockResult, StockQuote } from "../types/stock.js";
import { getStockQuote } from "./stock-quote.service.js";
import { calculateChangePercent, readPreviousPrice, writeLastSeenPrice } from "../lib/stockPriceChange.js";

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase();
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

  await writeLastSeenPrice(quote.symbol, quote.price);

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
