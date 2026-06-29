import { MAX_STOCK_QUOTES_BATCH_SIZE } from "@trading-signal/contracts/stock.js";
import type { StockQuotesBody } from "./types.js";

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

/** Parses POST /stocks/quotes body fields from the request. */
export function parseStockQuotesBody(body: unknown): StockQuotesBody {
  if (!isRecord(body) || !Array.isArray(body.symbols)) {
    return { symbols: [] };
  }

  const uniqueSymbols = new Set<string>();

  for (const entry of body.symbols) {
    if (typeof entry !== "string") {
      continue;
    }

    const normalized = normalizeSymbol(entry);
    if (normalized) {
      uniqueSymbols.add(normalized);
    }

    if (uniqueSymbols.size >= MAX_STOCK_QUOTES_BATCH_SIZE) {
      break;
    }
  }

  return { symbols: [...uniqueSymbols] };
}
