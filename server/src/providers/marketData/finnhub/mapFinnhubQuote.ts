import type { StockQuote } from "../../../types/stock.js";
import type { FinnhubMetricResponse, FinnhubProfileResponse, FinnhubQuoteResponse } from "./types.js";

/** Resolves a usable live price from Finnhub quote fields. */
function resolveQuotePrice(quote: FinnhubQuoteResponse, symbol: string): number {
  const current = Number(quote.c);
  if (Number.isFinite(current) && current > 0) {
    return current;
  }

  const previousClose = Number(quote.pc);
  if (Number.isFinite(previousClose) && previousClose > 0) {
    return previousClose;
  }

  throw new Error(`Finnhub returned an invalid price for ${symbol}`);
}

/** Maps Finnhub quote, profile, and metric payloads to a stock quote. */
export function mapFinnhubQuote(
  symbol: string,
  quote: FinnhubQuoteResponse,
  profile: FinnhubProfileResponse | null,
  metrics: FinnhubMetricResponse | null,
): StockQuote {
  const price = resolveQuotePrice(quote, symbol);
  const peRatio = Number(metrics?.metric?.peBasic ?? 0);

  return {
    symbol,
    name: String(profile?.name ?? `${symbol} Inc.`),
    price,
    peRatio: Number.isFinite(peRatio) ? peRatio : 0,
    sector: String(profile?.finnhubIndustry ?? "Unknown"),
  };
}
