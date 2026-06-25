import { toStockProviderError } from "../../../lib/stockProviderErrors.js";
import type { StockQuote } from "../../../types/stock.js";
import { finnhubGet } from "./client.js";
import { mapFinnhubQuote } from "./mapFinnhubQuote.js";
import { normalizeSymbol } from "./normalizeSymbol.js";
import { fetchOptionalFinnhub } from "./optionalFetch.js";
import type { FinnhubMetricResponse, FinnhubProfileResponse, FinnhubQuoteResponse } from "./types.js";

/** Fetches a stock quote with optional profile and P/E enrichment from Finnhub. */
export async function fetchFinnhubQuote(symbol: string): Promise<StockQuote> {
  const normalizedSymbol = normalizeSymbol(symbol);

  try {
    const [quote, profile, metrics] = await Promise.all([
      finnhubGet<FinnhubQuoteResponse>("/quote", { symbol: normalizedSymbol }),
      fetchOptionalFinnhub<FinnhubProfileResponse>(
        "/stock/profile2",
        { symbol: normalizedSymbol },
        normalizedSymbol,
        "profile2",
      ),
      fetchOptionalFinnhub<FinnhubMetricResponse>(
        "/stock/metric",
        { symbol: normalizedSymbol, metric: "all" },
        normalizedSymbol,
        "metric",
      ),
    ]);

    return mapFinnhubQuote(normalizedSymbol, quote, profile, metrics);
  } catch (error) {
    throw toStockProviderError(error, `quote for ${normalizedSymbol}`);
  }
}
